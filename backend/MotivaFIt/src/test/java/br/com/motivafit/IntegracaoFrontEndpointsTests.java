package br.com.motivafit;

import br.com.motivafit.entity.Usuario;
import br.com.motivafit.repository.UsuarioRepository;
import br.com.motivafit.service.MetricasService;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Rotas e consultas criadas para a integração com o frontend, exercitadas contra PostgreSQL real.
 */
@Import(TestcontainersConfiguration.class)
@TestPropertySource(properties = {
        "JWT_SECRET=motivafit-tests-only-secret-key-with-more-than-32-bytes",
        "JWT_ISSUER=motivafit-test"
})
@AutoConfigureMockMvc
@SpringBootTest
class IntegracaoFrontEndpointsTests {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private JdbcTemplate jdbc;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private MetricasService metricasService;

    private String sufixo;

    @BeforeEach
    void setUp() {
        sufixo = UUID.randomUUID().toString().substring(0, 8);
    }

    private Usuario usuario(String nome, String perfil) {
        Long id = jdbc.queryForObject(
                "INSERT INTO usuario (email, perfil, senha_hash, ativo) VALUES (?, ?, 'hash', true) RETURNING id",
                Long.class, nome + "-" + sufixo + "@test.com", perfil);
        return usuarioRepository.findById(id).orElseThrow();
    }

    private Long catalogo(String modalidade) {
        return jdbc.queryForObject(
                "INSERT INTO catalogo_exercicio (nome, modalidade, grupo_muscular) VALUES (?, ?, 'Teste') RETURNING id",
                Long.class, "Exercicio " + modalidade + " " + sufixo, modalidade);
    }

    private long criarDesafio(Usuario criador, Long catalogoId, String visibilidade) throws Exception {
        String corpo = """
                {"titulo":"Desafio %s","prazo":"%s","visibilidade":"%s",
                 "itens":[{"catalogoId":%d,"metaRepeticoes":100,"metaCargaKg":50}]}
                """.formatted(sufixo, LocalDate.now().plusDays(10), visibilidade, catalogoId);
        String resposta = mockMvc.perform(post("/api/desafios").with(user(criador))
                        .contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(resposta, "$.id")).longValue();
    }

    @Test
    void preferenciasDeTemaSaoGravadasNaConta() throws Exception {
        Usuario aluno = usuario("tema", "USUARIO");

        mockMvc.perform(get("/api/usuarios/me/preferencias").with(user(aluno)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.tema").value("system"));
        mockMvc.perform(put("/api/usuarios/me/preferencias").with(user(aluno))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"tema\":\"dark\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.tema").value("dark"));
        mockMvc.perform(put("/api/usuarios/me/preferencias").with(user(aluno))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"tema\":\"azul\"}"))
                .andExpect(status().isBadRequest());

        assertEquals("dark", jdbc.queryForObject("SELECT tema FROM usuario WHERE id = ?", String.class, aluno.getId()));
    }

    @Test
    void buscaPorEmailExatoNaoRetornaAPropriaConta() throws Exception {
        Usuario aluno = usuario("busca", "USUARIO");
        Usuario amigo = usuario("amigo", "USUARIO");

        mockMvc.perform(get("/api/usuarios/busca").param("email", "  " + amigo.getEmail().toUpperCase() + " ").with(user(aluno)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(amigo.getId()))
                .andExpect(jsonPath("$.email").value(amigo.getEmail()));
        mockMvc.perform(get("/api/usuarios/busca").param("email", aluno.getEmail()).with(user(aluno)))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/usuarios/busca").param("email", "amigo-" + sufixo).with(user(aluno)))
                .andExpect(status().isNotFound());
    }

    @Test
    void convidadoEnxergaDesafioPrivadoEProgressoSomaRegistros() throws Exception {
        Usuario criador = usuario("criador", "USUARIO");
        Usuario convidado = usuario("convidado", "USUARIO");
        Usuario estranho = usuario("estranho", "USUARIO");
        Long supino = catalogo("MUSCULACAO");
        long desafioId = criarDesafio(criador, supino, "PRIVADO");

        mockMvc.perform(get("/api/desafios").with(user(convidado)))
                .andExpect(jsonPath("$[*].id", not(hasItem((int) desafioId))));
        mockMvc.perform(post("/api/desafios/{id}/participantes", desafioId).with(user(criador))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"usuarioId\":" + convidado.getId() + "}"))
                .andExpect(status().isCreated());
        mockMvc.perform(get("/api/desafios").with(user(convidado)))
                .andExpect(jsonPath("$[*].id", hasItem((int) desafioId)));
        mockMvc.perform(get("/api/desafios/{id}", desafioId).with(user(estranho)))
                .andExpect(status().isNotFound());

        mockMvc.perform(patch("/api/desafios/{id}/participantes/me", desafioId).with(user(convidado))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"ACEITO\"}"))
                .andExpect(status().isOk());
        // 2 registros: 3x10 e 2x15 = 60 repetições; carga máxima 55 kg.
        jdbc.update("INSERT INTO registro_diario (usuario_id, catalogo_id, exercicio_nome, carga_kg, repeticoes, series, executado_em) VALUES (?, ?, 'Supino', 40, 10, 3, now() + interval '1 minute')",
                convidado.getId(), supino);
        jdbc.update("INSERT INTO registro_diario (usuario_id, catalogo_id, exercicio_nome, carga_kg, repeticoes, series, executado_em) VALUES (?, ?, 'Supino', 55, 15, 2, now() + interval '2 minutes')",
                convidado.getId(), supino);

        mockMvc.perform(get("/api/desafios/{id}/progresso", desafioId).with(user(convidado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].usuarioId").value(convidado.getId()))
                .andExpect(jsonPath("$[0].itens[0].repeticoes").value(60))
                .andExpect(jsonPath("$[0].itens[0].cargaMaxKg").value(55.0))
                .andExpect(jsonPath("$[0].itens[0].concluido").value(false))
                .andExpect(jsonPath("$[0].itens[0].percentual").value(80.0))
                .andExpect(jsonPath("$[1].usuarioId").value(criador.getId()))
                .andExpect(jsonPath("$[1].percentual").value(0));
    }

    @Test
    void usuarioEntraEmDesafioPublicoMasNaoEmPrivado() throws Exception {
        Usuario criador = usuario("dono", "USUARIO");
        Usuario aluno = usuario("entrante", "USUARIO");
        Long corrida = catalogo("MUSCULACAO");
        long publico = criarDesafio(criador, corrida, "PUBLICO");
        long privado = criarDesafio(criador, corrida, "PRIVADO");

        mockMvc.perform(post("/api/desafios/{id}/participantes/me", publico).with(user(aluno)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.estado").value("ACEITO"));
        mockMvc.perform(post("/api/desafios/{id}/participantes/me", publico).with(user(aluno)))
                .andExpect(status().isConflict());
        mockMvc.perform(post("/api/desafios/{id}/participantes/me", privado).with(user(aluno)))
                .andExpect(status().isNotFound());
    }

    @Test
    void edicaoDoDesafioSubstituiOsItens() throws Exception {
        Usuario criador = usuario("editor", "USUARIO");
        Long supino = catalogo("MUSCULACAO");
        Long corrida = catalogo("AEROBICO");
        long desafioId = criarDesafio(criador, supino, "PRIVADO");

        mockMvc.perform(put("/api/desafios/{id}", desafioId).with(user(criador))
                        .contentType(MediaType.APPLICATION_JSON).content("""
                                {"titulo":"Novo título","prazo":"%s","itens":[{"catalogoId":%d,"metaDistanciaM":5000}]}
                                """.formatted(LocalDate.now().plusDays(5), corrida)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titulo").value("Novo título"))
                .andExpect(jsonPath("$.itens.length()").value(1))
                .andExpect(jsonPath("$.itens[0].catalogoId").value(corrida))
                .andExpect(jsonPath("$.itens[0].metaDistanciaM").value(5000.0));
        assertEquals(1, jdbc.queryForObject("SELECT count(*) FROM desafio_item WHERE desafio_id = ?", Integer.class, desafioId));
    }

    @Test
    void convidadoListaConvitesDeGrupoEMembroPublicaNoFeed() throws Exception {
        Usuario admin = usuario("grupo-admin", "USUARIO");
        Usuario convidado = usuario("grupo-convidado", "USUARIO");
        String grupo = mockMvc.perform(post("/api/grupos").with(user(admin))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"nome\":\"Corrida " + sufixo + "\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long grupoId = ((Number) JsonPath.read(grupo, "$.id")).longValue();
        mockMvc.perform(post("/api/grupos/{id}/convites", grupoId).with(user(admin))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"usuarioId\":" + convidado.getId() + "}"))
                .andExpect(status().isCreated());

        String convites = mockMvc.perform(get("/api/grupos/convites").with(user(convidado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].grupoNome").value("Corrida " + sufixo))
                .andExpect(jsonPath("$[0].convidanteEmail").value(admin.getEmail()))
                .andReturn().getResponse().getContentAsString();
        String token = JsonPath.read(convites, "$[0].token");

        mockMvc.perform(post("/api/grupos/{id}/feed", grupoId).with(user(convidado))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"conteudo\":\"Olá\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/grupos/convites/aceite").with(user(convidado))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"token\":\"" + token + "\"}"))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/grupos/convites").with(user(convidado)))
                .andExpect(jsonPath("$.length()").value(0));
        mockMvc.perform(post("/api/grupos/{id}/feed", grupoId).with(user(convidado))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"conteudo\":\"  Bati meu recorde!  \"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tipo").value("PUBLICACAO"))
                .andExpect(jsonPath("$.conteudo").value("Bati meu recorde!"));
        mockMvc.perform(post("/api/grupos/{id}/feed", grupoId).with(user(convidado))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"conteudo\":\"   \"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void naoHaRotaQueListeTreinosDeOutrasContasParaAdministradores() throws Exception {
        Usuario admin = usuario("admin", "ADMINISTRADOR");

        mockMvc.perform(get("/api/admin/treinos").with(user(admin)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("ROTA_NAO_ENCONTRADA"));
    }

    @Test
    void parametroAusenteEMetodoErradoNaoViramErroInterno() throws Exception {
        Usuario aluno = usuario("erros", "USUARIO");

        mockMvc.perform(get("/api/usuarios/busca").with(user(aluno)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("PARAMETRO_OBRIGATORIO"));
        mockMvc.perform(delete("/api/usuarios/me/preferencias").with(user(aluno)))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.codigo").value("METODO_NAO_SUPORTADO"));
    }

    @Test
    void metricasDeRotinasSerieERetencaoUsamDadosReais() {
        // Janela isolada no passado para não depender de outros dados do banco.
        LocalDate segunda = LocalDate.of(2021, 3, 1);
        Usuario autor = usuario("autor", "USUARIO");
        Usuario copiador = usuario("copiador", "USUARIO");
        jdbc.update("UPDATE usuario SET created_at = TIMESTAMPTZ '2021-03-01 12:00:00-03' WHERE id IN (?, ?)", autor.getId(), copiador.getId());
        Long supino = catalogo("MUSCULACAO");
        Long origem = jdbc.queryForObject("INSERT INTO treino (usuario_id, nome, tipo, visibilidade, created_at) VALUES (?, ?, 'MUSCULACAO', 'PUBLICO', TIMESTAMPTZ '2021-03-01 12:00:00-03') RETURNING id",
                Long.class, autor.getId(), "Origem " + sufixo);
        jdbc.update("INSERT INTO treino (usuario_id, nome, tipo, treino_origem_id, created_at) VALUES (?, ?, 'MUSCULACAO', ?, TIMESTAMPTZ '2021-03-02 12:00:00-03')",
                copiador.getId(), "Cópia " + sufixo, origem);
        // Ativação nos 7 primeiros dias (autor e copiador), retenção na 2ª semana só do autor.
        jdbc.update("INSERT INTO registro_diario (usuario_id, catalogo_id, treino_id, exercicio_nome, tempo_s, executado_em) VALUES (?, ?, ?, 'Supino', 60, TIMESTAMPTZ '2021-03-03 10:00:00-03')",
                autor.getId(), supino, origem);
        jdbc.update("INSERT INTO registro_diario (usuario_id, catalogo_id, exercicio_nome, tempo_s, executado_em) VALUES (?, ?, 'Supino', 60, TIMESTAMPTZ '2021-03-05 10:00:00-03')",
                copiador.getId(), supino);
        jdbc.update("INSERT INTO registro_diario (usuario_id, catalogo_id, exercicio_nome, tempo_s, executado_em) VALUES (?, ?, 'Supino', 60, TIMESTAMPTZ '2021-03-09 10:00:00-03')",
                autor.getId(), supino);

        var rotinas = metricasService.rotinas(segunda, segunda.plusDays(13), 10);
        assertTrue(rotinas.treinosPublicosMaisAdicionados().stream()
                .anyMatch(item -> item.treinoId() == origem && item.adicoes() == 1 && item.posicao() >= 1));
        assertEquals(0, rotinas.percentualRegistrosComTreino().compareTo(java.math.BigDecimal.valueOf(100.0 / 3)));

        var tempo = metricasService.rankingTempo(segunda, segunda.plusDays(13), 10);
        assertEquals(180, tempo.tempoTotalS());
        assertEquals(90, tempo.mediaPorUsuarioAtivoS());
        assertEquals(0, new java.math.BigDecimal("90").compareTo(tempo.medianaPorUsuarioAtivoS()));

        var ativos = metricasService.ativos(segunda, segunda.plusDays(13), br.com.motivafit.metricas.AgrupamentoEvolucao.SEMANA);
        assertTrue(ativos.serie().stream().anyMatch(ponto -> ponto.periodo().equals("2021-03-01") && ponto.ativos() == 2));
        assertTrue(ativos.serie().stream().anyMatch(ponto -> ponto.periodo().equals("2021-03-08") && ponto.ativos() == 1));

        var retencao = metricasService.retencao(LocalDate.of(2021, 3, 7), 1);
        assertEquals(1, retencao.coortes().size());
        var coorte = retencao.coortes().get(0);
        assertEquals("2021-03-01", coorte.semana());
        assertEquals(2, coorte.cadastrados());
        assertEquals(2, coorte.ativados7Dias());
        assertEquals(1, coorte.retidosSemana2());
        assertEquals(0, new java.math.BigDecimal("100.0").compareTo(retencao.taxaAtivacao7Dias()));
        assertEquals(2, retencao.medianaDiasAtePrimeiroRegistro());
    }
}
