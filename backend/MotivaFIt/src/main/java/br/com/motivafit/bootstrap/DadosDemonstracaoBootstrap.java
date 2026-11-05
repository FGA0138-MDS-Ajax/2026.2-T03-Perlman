package br.com.motivafit.bootstrap;

import br.com.motivafit.entity.*;
import br.com.motivafit.enums.*;
import br.com.motivafit.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Component
@Profile("dev")
public class DadosDemonstracaoBootstrap implements CommandLineRunner {

    private final UsuarioRepository usuarios;
    private final CatalogoExercicioRepository catalogo;
    private final TreinoRepository treinos;
    private final ExercicioRepository exercicios;
    private final RegistroDiarioRepository registros;
    private final RefreshTokenRepository refreshTokens;
    private final ConviteAdminRepository convites;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Value("${admin.bootstrap.email:superusuario-test@motivafit.com}")
    private String emailSuperusuario;

    @Value("${admin.bootstrap.senha-temporaria:SenhaBootstrapTeste123!}")
    private String senhaSuperusuario;

    public DadosDemonstracaoBootstrap(UsuarioRepository usuarios,
                                     CatalogoExercicioRepository catalogo,
                                     TreinoRepository treinos,
                                     ExercicioRepository exercicios,
                                     RegistroDiarioRepository registros,
                                     RefreshTokenRepository refreshTokens,
                                     ConviteAdminRepository convites,
                                     PasswordEncoder passwordEncoder,
                                     JdbcTemplate jdbcTemplate) {
        this.usuarios = usuarios;
        this.catalogo = catalogo;
        this.treinos = treinos;
        this.exercicios = exercicios;
        this.registros = registros;
        this.refreshTokens = refreshTokens;
        this.convites = convites;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(String... args) {
        limparDadosAplicacao();

        String emailAdmin = emailSuperusuario == null || emailSuperusuario.isBlank()
                ? "superusuario-test@motivafit.com" : emailSuperusuario;
        String senhaAdmin = senhaSuperusuario == null || senhaSuperusuario.isBlank()
                ? "SenhaBootstrapTeste123!" : senhaSuperusuario;
        Usuario superusuario = criarUsuario(emailAdmin, senhaAdmin, Perfil.SUPERUSUARIO);
        List<Usuario> usuariosDemo = new ArrayList<>();
        for (int i = 1; i <= 4; i++) {
            usuariosDemo.add(criarUsuario("usuario-teste-%02d@motivafit.com".formatted(i), "SenhaBootstrapTeste123!", Perfil.USUARIO));
        }

        List<CatalogoExercicio> itens = criarCatalogoDemo();
        criarDadosTreinoDemo(usuariosDemo, itens);

        criarRefreshTokenRevogado(usuariosDemo.getFirst());
        criarConviteRevogado(superusuario);
    }

    private List<CatalogoExercicio> criarCatalogoDemo() {
        String[][] musculacao = {
                {"Supino reto", "Peito"}, {"Supino inclinado", "Peito"}, {"Crucifixo", "Peito"},
                {"Puxada frontal", "Costas"}, {"Remada baixa", "Costas"}, {"Levantamento terra", "Costas"},
                {"Desenvolvimento de ombros", "Ombros"}, {"Elevação lateral", "Ombros"},
                {"Rosca direta", "Bíceps"}, {"Rosca martelo", "Bíceps"}, {"Tríceps pulley", "Tríceps"},
                {"Agachamento livre", "Pernas"}, {"Leg press", "Pernas"}, {"Cadeira extensora", "Quadríceps"},
                {"Mesa flexora", "Posterior de coxa"}, {"Panturrilha em pé", "Panturrilhas"}
        };
        String[][] aerobicos = {
                {"Esteira", "Corpo inteiro"}, {"Bicicleta ergométrica", "Corpo inteiro"},
                {"Elíptico", "Corpo inteiro"}, {"Remo ergométrico", "Corpo inteiro"}
        };
        List<CatalogoExercicio> itens = new ArrayList<>();
        for (String[] item : musculacao) itens.add(criarCatalogo(item[0], Modalidade.MUSCULACAO, item[1]));
        for (String[] item : aerobicos) itens.add(criarCatalogo(item[0], Modalidade.AEROBICO, item[1]));
        return itens;
    }

    private void criarDadosTreinoDemo(List<Usuario> usuariosDemo, List<CatalogoExercicio> itens) {
        for (int treinoIndice = 0; treinoIndice < 12; treinoIndice++) {
            Usuario usuario = usuariosDemo.get(treinoIndice % usuariosDemo.size());
            boolean musculacao = treinoIndice % 3 != 0;
            TipoTreino tipo = musculacao ? TipoTreino.MUSCULACAO : TipoTreino.AEROBICO;
            String nomeTreino = musculacao
                    ? "Treino de força %02d".formatted(treinoIndice + 1)
                    : "Treino cardio %02d".formatted(treinoIndice + 1);
            Treino treino = criarTreino(usuario, nomeTreino, tipo,
                    treinoIndice % 2 == 0 ? Visibilidade.PUBLICO : Visibilidade.PRIVADO);

            List<Exercicio> exerciciosTreino = new ArrayList<>();
            for (int exercicioIndice = 0; exercicioIndice < 4; exercicioIndice++) {
                int catalogoIndice = musculacao
                        ? (treinoIndice * 3 + exercicioIndice) % 16
                        : 16 + ((treinoIndice + exercicioIndice) % 4);
                CatalogoExercicio item = itens.get(catalogoIndice);
                exerciciosTreino.add(criarExercicio(treino, item,
                        musculacao ? "4 séries de %d repetições".formatted(8 + exercicioIndice * 2)
                                : "%d minutos".formatted(20 + exercicioIndice * 5),
                        musculacao ? "%d kg".formatted(40 + treinoIndice * 5 + exercicioIndice * 2) : null));
            }

            for (int registroIndice = 0; registroIndice < 3; registroIndice++) {
                Exercicio exercicio = exerciciosTreino.get(registroIndice);
                CatalogoExercicio item = exercicio.getCatalogoExercicio();
                boolean treinoDeForca = item.getModalidade() == Modalidade.MUSCULACAO;
                String chave = "registro-demo-%02d-%02d".formatted(treinoIndice + 1, registroIndice + 1);
                criarRegistro(usuario, item, treino, exercicio, chave,
                        treinoDeForca ? BigDecimal.valueOf(30L + treinoIndice * 5L) : null,
                        treinoDeForca ? 8 + registroIndice * 2 : null,
                        treinoDeForca ? 3 + registroIndice % 2 : null,
                        treinoDeForca ? null : 1200 + registroIndice * 300,
                        treinoDeForca ? null : BigDecimal.valueOf(3000L + registroIndice * 500L));
            }
        }
    }

    private void limparDadosAplicacao() {
        jdbcTemplate.execute("TRUNCATE TABLE convite_admin, registro_diario, exercicio, treino, refresh_token, catalogo_exercicio, usuario RESTART IDENTITY CASCADE");
    }

    private Usuario criarUsuario(String email, String senha, Perfil perfil) {
        return usuarios.findByEmail(email).orElseGet(() -> {
            Usuario novo = new Usuario();
            novo.setEmail(email);
            novo.setSenhaHash(passwordEncoder.encode(senha));
            novo.setPerfil(perfil);
            novo.setAtivo(true);
            return usuarios.save(novo);
        });
    }

    private CatalogoExercicio criarCatalogo(String nome, Modalidade modalidade, String grupo) {
        return catalogo.findByNomeIgnoreCase(nome).orElseGet(() -> catalogo.save(new CatalogoExercicio(nome, modalidade, grupo)));
    }

    private Treino criarTreino(Usuario usuario, String nome, TipoTreino tipo, Visibilidade visibilidade) {
        return treinos.findByUsuarioIdAndNome(usuario.getId(), nome).orElseGet(() -> {
            Treino treino = new Treino();
            treino.setUsuarioId(usuario.getId());
            treino.setNome(nome);
            treino.setTipo(tipo);
            treino.setVisibilidade(visibilidade);
            return treinos.save(treino);
        });
    }

    private Exercicio criarExercicio(Treino treino, CatalogoExercicio item, String meta, String recorde) {
        if (exercicios.existsByTreinoIdAndCatalogoExercicioId(treino.getId(), item.getId())) {
            return exercicios.findByTreinoId(treino.getId()).stream()
                    .filter(ex -> ex.getCatalogoExercicio().getId().equals(item.getId())).findFirst().orElseThrow();
        }
        Exercicio exercicio = new Exercicio();
        exercicio.setTreino(treino);
        exercicio.setCatalogoExercicio(item);
        exercicio.setMeta(meta);
        exercicio.setMetaRecorde(recorde);
        return exercicios.save(exercicio);
    }

    private void criarRegistro(Usuario usuario, CatalogoExercicio item, Treino treino, Exercicio exercicio,
                               String chave, BigDecimal carga, Integer repeticoes, Integer series,
                               Integer tempo, BigDecimal distancia) {
        if (registros.findByUsuarioIdAndChaveIdempotencia(usuario.getId(), chave).isPresent()) return;
        RegistroDiario registro = new RegistroDiario();
        registro.setUsuarioId(usuario.getId());
        registro.setCatalogoId(item.getId());
        registro.setTreinoId(treino.getId());
        registro.setExercicioId(exercicio == null ? null : exercicio.getId());
        registro.setTreinoNome(treino.getNome());
        registro.setExercicioNome(item.getNome());
        registro.setCargaKg(carga);
        registro.setRepeticoes(repeticoes);
        registro.setSeries(series);
        registro.setTempoS(tempo);
        registro.setDistanciaM(distancia);
        registro.setExecutadoEm(OffsetDateTime.now().minusDays(1));
        registro.setChaveIdempotencia(chave);
        registros.save(registro);
    }

    private void criarRefreshTokenRevogado(Usuario usuario) {
        String hash = "dev-seed-refresh-token-revoked";
        if (refreshTokens.findByHash(hash).isPresent()) return;
        RefreshToken token = new RefreshToken();
        token.setHash(hash);
        token.setFamilia("dev-seed");
        token.setUsuarioId(usuario);
        token.setValidade(Date.from(Instant.now().minusSeconds(3600)));
        token.setRevogacao(Date.from(Instant.now().minusSeconds(3600)));
        refreshTokens.save(token);
    }

    private void criarConviteRevogado(Usuario superusuario) {
        String hash = "dev-seed-invite-revoked";
        if (convites.findByTokenHash(hash).isPresent()) return;
        ConviteAdmin convite = new ConviteAdmin();
        convite.setConvidador(superusuario);
        convite.setEmail("administrador-convidado@motivafit.com");
        convite.setTokenHash(hash);
        convite.setExpiraEm(Instant.now().minusSeconds(3600));
        convite.setEstado(Estado.REVOGADO);
        convites.save(convite);
    }
}
