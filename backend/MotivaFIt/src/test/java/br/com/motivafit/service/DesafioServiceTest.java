package br.com.motivafit.service;

import br.com.motivafit.dto.request.AdicionarParticipanteRequestDTO;
import br.com.motivafit.dto.request.DesafioItemRequestDTO;
import br.com.motivafit.dto.request.DesafioRequestDTO;
import br.com.motivafit.dto.request.ParticipanteUpdateRequestDTO;
import br.com.motivafit.dto.response.DesafioItemResponseDTO;
import br.com.motivafit.dto.response.DesafioParticipanteResponseDTO;
import br.com.motivafit.dto.response.DesafioResponseDTO;
import br.com.motivafit.entity.CatalogoExercicio;
import br.com.motivafit.entity.Desafio;
import br.com.motivafit.entity.DesafioItem;
import br.com.motivafit.entity.DesafioParticipante;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.EstadoDesafio;
import br.com.motivafit.enums.EstadoParticipante;
import br.com.motivafit.enums.Modalidade;
import br.com.motivafit.enums.Visibilidade;
import br.com.motivafit.exception.AcessoNegadoException;
import br.com.motivafit.exception.ConflitoException;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.exception.RequisicaoInvalidaException;
import br.com.motivafit.repository.CatalogoExercicioRepository;
import br.com.motivafit.repository.DesafioItemRepository;
import br.com.motivafit.repository.DesafioParticipanteRepository;
import br.com.motivafit.repository.DesafioRepository;
import br.com.motivafit.repository.RegistroDiarioRepository;
import br.com.motivafit.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DesafioServiceTest {
    private static final Long USUARIO_ID = 7L;
    private static final Long OUTRO_USUARIO_ID = 99L;
    private static final Long DESAFIO_ID = 100L;
    private static final Long SUPINO_ID = 1L;
    private static final Long CORRIDA_ID = 2L;

    private DesafioRepository desafioRepository;
    private DesafioItemRepository itemRepository;
    private DesafioParticipanteRepository participanteRepository;
    private CatalogoExercicioRepository catalogoRepository;
    private UsuarioRepository usuarioRepository;
    private RegistroDiarioRepository registroRepository;
    private DesafioService service;

    @BeforeEach
    void setup() {
        desafioRepository = mock(DesafioRepository.class);
        itemRepository = mock(DesafioItemRepository.class);
        participanteRepository = mock(DesafioParticipanteRepository.class);
        catalogoRepository = mock(CatalogoExercicioRepository.class);
        usuarioRepository = mock(UsuarioRepository.class);
        registroRepository = mock(RegistroDiarioRepository.class);
        service = new DesafioService(desafioRepository, itemRepository, participanteRepository, catalogoRepository, usuarioRepository, registroRepository);
    }

    @Test
    void criaDesafioComExerciciosDoCatalogoEOCriadorComoParticipanteAceito() {
        stubCatalogos();
        stubSalvar();
        LocalDate prazo = hoje().plusDays(10);

        DesafioResponseDTO response = service.create(USUARIO_ID,
                new DesafioRequestDTO("  Desafio das 100 repetições ", prazo, List.of(supinoMeta(), corridaMeta())));

        assertEquals(DESAFIO_ID, response.id());
        assertEquals("Desafio das 100 repetições", response.titulo());
        assertEquals(prazo, response.prazo());
        assertEquals(EstadoDesafio.ATIVO, response.estado());
        assertTrue(response.souCriador());
        assertEquals(2, response.itens().size());
        DesafioItemResponseDTO supino = response.itens().get(0);
        assertEquals(1L, supino.id());
        assertEquals(SUPINO_ID, supino.catalogoId());
        assertEquals("Supino reto", supino.exercicioNome());
        assertEquals(Modalidade.MUSCULACAO, supino.modalidade());
        assertEquals(new BigDecimal("80"), supino.metaCargaKg());
        assertEquals(100, supino.metaRepeticoes());
        assertEquals(3, supino.metaSeries());
        assertNull(supino.metaTempoS());
        DesafioItemResponseDTO corrida = response.itens().get(1);
        assertEquals("Corrida", corrida.exercicioNome());
        assertEquals(Modalidade.AEROBICO, corrida.modalidade());
        assertEquals(1800, corrida.metaTempoS());
        assertEquals(new BigDecimal("5000"), corrida.metaDistanciaM());

        Desafio salvo = capturarDesafio();
        assertEquals(USUARIO_ID, salvo.getCriadorId());
        assertEquals("Desafio das 100 repetições", salvo.getTitulo());
        assertEquals(prazo, salvo.getPrazo());
        assertEquals(EstadoDesafio.ATIVO, salvo.getEstado());

        List<DesafioItem> itensSalvos = capturarItens();
        assertEquals(2, itensSalvos.size());
        assertEquals(DESAFIO_ID, itensSalvos.get(0).getDesafioId());
        assertEquals(SUPINO_ID, itensSalvos.get(0).getCatalogoId());
        assertEquals(DESAFIO_ID, itensSalvos.get(1).getDesafioId());
        assertEquals(CORRIDA_ID, itensSalvos.get(1).getCatalogoId());

        ArgumentCaptor<DesafioParticipante> captor = ArgumentCaptor.forClass(DesafioParticipante.class);
        verify(participanteRepository).save(captor.capture());
        DesafioParticipante criador = captor.getValue();
        assertEquals(DESAFIO_ID, criador.getDesafioId());
        assertEquals(USUARIO_ID, criador.getUsuarioId());
        assertEquals(EstadoParticipante.ACEITO, criador.getEstado());
        assertNotNull(criador.getAceitoEm());
    }

    @Test
    void aceitaPrazoQueTerminaHoje() {
        stubCatalogos();
        stubSalvar();

        assertDoesNotThrow(() -> service.create(USUARIO_ID,
                new DesafioRequestDTO("Desafio relâmpago", hoje(), List.of(supinoMeta()))));
    }

    @Test
    void prazoNoPassadoGeraRequisicaoInvalidaSemTocarNoBanco() {
        RequisicaoInvalidaException erro = assertThrows(RequisicaoInvalidaException.class, () -> service.create(
                USUARIO_ID, new DesafioRequestDTO("Desafio", hoje().minusDays(1), List.of(supinoMeta()))));

        assertEquals("DESAFIO_INVALIDO", erro.getCodigo());
        assertEquals(HttpStatus.BAD_REQUEST, erro.getStatus());
        verifyNoInteractions(catalogoRepository, desafioRepository, itemRepository, participanteRepository);
    }

    @Test
    void mesmoExercicioDuasVezesGeraRequisicaoInvalida() {
        RequisicaoInvalidaException erro = assertThrows(RequisicaoInvalidaException.class, () -> service.create(
                USUARIO_ID, new DesafioRequestDTO("Desafio", hoje().plusDays(5), List.of(supinoMeta(), supinoMeta()))));

        assertEquals("DESAFIO_INVALIDO", erro.getCodigo());
        verifyNoInteractions(catalogoRepository, desafioRepository);
    }

    @Test
    void exercicioDoCatalogoInexistenteOuDesativadoGeraNaoEncontradoSemSalvar() {
        when(catalogoRepository.findByIdAndAtivoTrue(SUPINO_ID))
                .thenReturn(Optional.of(catalogo(SUPINO_ID, "Supino reto", Modalidade.MUSCULACAO)));

        NaoEncontradoException erro = assertThrows(NaoEncontradoException.class, () -> service.create(
                USUARIO_ID, new DesafioRequestDTO("Desafio", hoje().plusDays(5), List.of(supinoMeta(), corridaMeta()))));

        assertEquals("EXERCICIO_NAO_ENCONTRADO", erro.getCodigo());
        assertEquals(HttpStatus.NOT_FOUND, erro.getStatus());
        verify(desafioRepository, never()).saveAndFlush(any());
        verifyNoInteractions(itemRepository, participanteRepository);
    }

    @Test
    void exercicioSemNenhumaMetaGeraRequisicaoInvalida() {
        stubCatalogos();

        RequisicaoInvalidaException erro = assertThrows(RequisicaoInvalidaException.class, () -> service.create(
                USUARIO_ID, new DesafioRequestDTO("Desafio", hoje().plusDays(5),
                        List.of(new DesafioItemRequestDTO(SUPINO_ID, null, null, null, null, null)))));

        assertEquals("DESAFIO_INVALIDO", erro.getCodigo());
        verify(desafioRepository, never()).saveAndFlush(any());
    }

    @Test
    void musculacaoComMetaDeDistanciaGeraRequisicaoInvalida() {
        stubCatalogos();

        assertThrows(RequisicaoInvalidaException.class, () -> service.create(USUARIO_ID,
                new DesafioRequestDTO("Desafio", hoje().plusDays(5),
                        List.of(new DesafioItemRequestDTO(SUPINO_ID, null, 100, 3, null, new BigDecimal("100"))))));

        verify(desafioRepository, never()).saveAndFlush(any());
    }

    @Test
    void aerobicoComMetaDeCargaSeriesOuRepeticoesGeraRequisicaoInvalida() {
        stubCatalogos();

        assertThrows(RequisicaoInvalidaException.class, () -> service.create(USUARIO_ID,
                new DesafioRequestDTO("Desafio", hoje().plusDays(5),
                        List.of(new DesafioItemRequestDTO(CORRIDA_ID, new BigDecimal("10"), null, null, 1800, null)))));
        assertThrows(RequisicaoInvalidaException.class, () -> service.create(USUARIO_ID,
                new DesafioRequestDTO("Desafio", hoje().plusDays(5),
                        List.of(new DesafioItemRequestDTO(CORRIDA_ID, null, null, 3, 1800, null)))));
        assertThrows(RequisicaoInvalidaException.class, () -> service.create(USUARIO_ID,
                new DesafioRequestDTO("Desafio", hoje().plusDays(5),
                        List.of(new DesafioItemRequestDTO(CORRIDA_ID, null, 100, null, 1800, null)))));

        verify(desafioRepository, never()).saveAndFlush(any());
    }

    @Test
    void listaDesafiosCriadosPeloUsuarioEosPublicos() {
        CatalogoExercicio supino = catalogo(SUPINO_ID, "Supino reto", Modalidade.MUSCULACAO);
        CatalogoExercicio corrida = catalogo(CORRIDA_ID, "Corrida", Modalidade.AEROBICO);
        Desafio proprio = desafio(DESAFIO_ID, USUARIO_ID);
        Desafio publicoDeOutro = desafioPublico(101L, OUTRO_USUARIO_ID);
        Desafio privadoDeOutro = desafio(102L, OUTRO_USUARIO_ID);
        Desafio semItens = desafio(103L, USUARIO_ID);

        when(desafioRepository.findVisiveis(USUARIO_ID, EstadoDesafio.ATIVO, Visibilidade.PUBLICO))
                .thenReturn(List.of(proprio, publicoDeOutro, semItens));
        when(itemRepository.findAllByDesafioIdIn(any())).thenReturn(List.of(
                item(1L, DESAFIO_ID, SUPINO_ID), item(2L, DESAFIO_ID, CORRIDA_ID), item(3L, 101L, SUPINO_ID)));
        when(catalogoRepository.findAllById(any())).thenReturn(List.of(supino, corrida));

        List<DesafioResponseDTO> response = service.findAll(USUARIO_ID);

        assertEquals(3, response.size());
        assertEquals(DESAFIO_ID, response.get(0).id());
        assertTrue(response.get(0).souCriador());
        assertEquals(2, response.get(0).itens().size());
        assertEquals("Supino reto", response.get(0).itens().get(0).exercicioNome());
        assertEquals("Corrida", response.get(0).itens().get(1).exercicioNome());
        assertEquals(101L, response.get(1).id());
        assertFalse(response.get(1).souCriador());
        assertEquals(1, response.get(1).itens().size());
        assertEquals(103L, response.get(2).id());
        assertTrue(response.get(2).itens().isEmpty());
    }

    @Test
    void listaVaziaQuandoNaoHaDesafioVisivel() {
        when(desafioRepository.findVisiveis(USUARIO_ID, EstadoDesafio.ATIVO, Visibilidade.PUBLICO))
                .thenReturn(List.of());

        assertTrue(service.findAll(USUARIO_ID).isEmpty());
        verifyNoInteractions(itemRepository, catalogoRepository);
    }

    @Test
    void retornaDesafioPorIdQuandoCriadoPeloUsuario() {
        CatalogoExercicio supino = catalogo(SUPINO_ID, "Supino reto", Modalidade.MUSCULACAO);
        Desafio proprio = desafio(DESAFIO_ID, USUARIO_ID);

        when(desafioRepository.findVisivelPorId(DESAFIO_ID, USUARIO_ID, EstadoDesafio.ATIVO, Visibilidade.PUBLICO))
                .thenReturn(Optional.of(proprio));
        when(itemRepository.findAllByDesafioIdIn(List.of(DESAFIO_ID)))
                .thenReturn(List.of(item(1L, DESAFIO_ID, SUPINO_ID)));
        when(catalogoRepository.findAllById(any())).thenReturn(List.of(supino));

        DesafioResponseDTO response = service.findById(USUARIO_ID, DESAFIO_ID);

        assertEquals(DESAFIO_ID, response.id());
        assertTrue(response.souCriador());
        assertEquals(1, response.itens().size());
    }

    @Test
    void retornaDesafioPublicoPorIdMesmoQueNaoSejaCriador() {
        CatalogoExercicio supino = catalogo(SUPINO_ID, "Supino reto", Modalidade.MUSCULACAO);
        Desafio publico = desafioPublico(DESAFIO_ID, OUTRO_USUARIO_ID);

        when(desafioRepository.findVisivelPorId(DESAFIO_ID, USUARIO_ID, EstadoDesafio.ATIVO, Visibilidade.PUBLICO))
                .thenReturn(Optional.of(publico));
        when(itemRepository.findAllByDesafioIdIn(List.of(DESAFIO_ID)))
                .thenReturn(List.of(item(1L, DESAFIO_ID, SUPINO_ID)));
        when(catalogoRepository.findAllById(any())).thenReturn(List.of(supino));

        DesafioResponseDTO response = service.findById(USUARIO_ID, DESAFIO_ID);

        assertEquals(DESAFIO_ID, response.id());
        assertFalse(response.souCriador());
    }

    @Test
    void desafioPrivadoDeOutroUsuarioNaoEEncontrado() {
        when(desafioRepository.findVisivelPorId(DESAFIO_ID, USUARIO_ID, EstadoDesafio.ATIVO, Visibilidade.PUBLICO))
                .thenReturn(Optional.empty());

        NaoEncontradoException erro = assertThrows(NaoEncontradoException.class,
                () -> service.findById(USUARIO_ID, DESAFIO_ID));

        assertEquals("DESAFIO_NAO_ENCONTRADO", erro.getCodigo());
    }

    @Test
    void criadorAtualizaODesafio() {
        CatalogoExercicio supino = catalogo(SUPINO_ID, "Supino reto", Modalidade.MUSCULACAO);
        Desafio desafio = desafio(DESAFIO_ID, USUARIO_ID);
        LocalDate novoPrazo = hoje().plusDays(20);

        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO)).thenReturn(Optional.of(desafio));
        when(desafioRepository.save(any())).thenReturn(desafio);
        when(itemRepository.findAllByDesafioIdIn(List.of(DESAFIO_ID)))
                .thenReturn(List.of(item(1L, DESAFIO_ID, SUPINO_ID)));
        when(catalogoRepository.findAllById(any())).thenReturn(List.of(supino));

        DesafioResponseDTO response = service.update(USUARIO_ID, DESAFIO_ID,
                new DesafioRequestDTO("Novo título", novoPrazo, "Nova descrição", Visibilidade.PUBLICO, List.of()));

        assertEquals("Novo título", response.titulo());
        assertEquals(novoPrazo, response.prazo());
        assertEquals("Nova descrição", response.descricao());
        assertEquals(Visibilidade.PUBLICO, response.visibilidade());
        assertEquals("Novo título", desafio.getTitulo());
        assertEquals(novoPrazo, desafio.getPrazo());
        assertEquals("Nova descrição", desafio.getDescricao());
        assertEquals(Visibilidade.PUBLICO, desafio.getVisibilidade());
    }

    @Test
    void naoCriadorNaoPodeAtualizar() {
        Desafio desafio = desafio(DESAFIO_ID, OUTRO_USUARIO_ID);
        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO)).thenReturn(Optional.of(desafio));

        AcessoNegadoException erro = assertThrows(AcessoNegadoException.class, () -> service.update(
                USUARIO_ID, DESAFIO_ID,
                new DesafioRequestDTO("Novo título", hoje().plusDays(5), List.of())));

        assertEquals("DESAFIO_SOMENTE_CRIADOR", erro.getCodigo());
        assertEquals(HttpStatus.FORBIDDEN, erro.getStatus());
    }

    @Test
    void atualizarDesafioInexistenteGeraNaoEncontrado() {
        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO)).thenReturn(Optional.empty());

        NaoEncontradoException erro = assertThrows(NaoEncontradoException.class, () -> service.update(
                USUARIO_ID, DESAFIO_ID,
                new DesafioRequestDTO("Novo título", hoje().plusDays(5), List.of())));

        assertEquals("DESAFIO_NAO_ENCONTRADO", erro.getCodigo());
    }

    @Test
    void criadorRemoveODesafioCancelandoOEstadoSemApagarALinha() {
        Desafio desafio = desafio(DESAFIO_ID, USUARIO_ID);
        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO)).thenReturn(Optional.of(desafio));

        service.delete(USUARIO_ID, DESAFIO_ID);

        assertEquals(EstadoDesafio.CANCELADO, desafio.getEstado());
        verify(desafioRepository).save(desafio);
        verify(desafioRepository, never()).delete(any(Desafio.class));
        verify(desafioRepository, never()).deleteById(any());
        verifyNoInteractions(participanteRepository);
    }

    @Test
    void desafioInexistenteOuJaCanceladoGeraNaoEncontrado() {
        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO)).thenReturn(Optional.empty());

        NaoEncontradoException erro = assertThrows(NaoEncontradoException.class,
                () -> service.delete(USUARIO_ID, DESAFIO_ID));

        assertEquals("DESAFIO_NAO_ENCONTRADO", erro.getCodigo());
        assertEquals(HttpStatus.NOT_FOUND, erro.getStatus());
        verify(desafioRepository, never()).save(any());
    }

    @Test
    void participanteQueNaoECriadorRecebeAcessoNegadoENaoCancela() {
        Desafio desafio = desafio(DESAFIO_ID, OUTRO_USUARIO_ID);
        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO)).thenReturn(Optional.of(desafio));
        when(participanteRepository.existsByDesafioIdAndUsuarioIdAndEstadoNot(
                DESAFIO_ID, USUARIO_ID, EstadoParticipante.RECUSADO)).thenReturn(true);

        AcessoNegadoException erro = assertThrows(AcessoNegadoException.class,
                () -> service.delete(USUARIO_ID, DESAFIO_ID));

        assertEquals("DESAFIO_SOMENTE_CRIADOR", erro.getCodigo());
        assertEquals(HttpStatus.FORBIDDEN, erro.getStatus());
        assertEquals(EstadoDesafio.ATIVO, desafio.getEstado());
        verify(desafioRepository, never()).save(any());
    }

    @Test
    void quemNaoParticipaDoDesafioRecebeNaoEncontradoSemSaberQueEleExiste() {
        Desafio desafio = desafio(DESAFIO_ID, OUTRO_USUARIO_ID);
        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO)).thenReturn(Optional.of(desafio));
        when(participanteRepository.existsByDesafioIdAndUsuarioIdAndEstadoNot(
                DESAFIO_ID, USUARIO_ID, EstadoParticipante.RECUSADO)).thenReturn(false);

        assertThrows(NaoEncontradoException.class, () -> service.delete(USUARIO_ID, DESAFIO_ID));

        assertEquals(EstadoDesafio.ATIVO, desafio.getEstado());
        verify(desafioRepository, never()).save(any());
    }

    @Test
    void desafioCujoCriadorFoiExcluidoNaoPodeSerRemovidoPorParticipante() {
        Desafio orfao = desafio(DESAFIO_ID, null);
        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO)).thenReturn(Optional.of(orfao));
        when(participanteRepository.existsByDesafioIdAndUsuarioIdAndEstadoNot(
                DESAFIO_ID, USUARIO_ID, EstadoParticipante.RECUSADO)).thenReturn(true);

        assertThrows(AcessoNegadoException.class, () -> service.delete(USUARIO_ID, DESAFIO_ID));

        assertEquals(EstadoDesafio.ATIVO, orfao.getEstado());
    }

    private LocalDate hoje() {
        return LocalDate.now(ZoneId.of("America/Sao_Paulo"));
    }

    private void stubCatalogos() {
        when(catalogoRepository.findByIdAndAtivoTrue(SUPINO_ID))
                .thenReturn(Optional.of(catalogo(SUPINO_ID, "Supino reto", Modalidade.MUSCULACAO)));
        when(catalogoRepository.findByIdAndAtivoTrue(CORRIDA_ID))
                .thenReturn(Optional.of(catalogo(CORRIDA_ID, "Corrida", Modalidade.AEROBICO)));
    }

    private void stubSalvar() {
        when(desafioRepository.saveAndFlush(any(Desafio.class))).thenAnswer(invocation -> {
            Desafio salvo = invocation.getArgument(0);
            ReflectionTestUtils.setField(salvo, "id", DESAFIO_ID);
            return salvo;
        });
        when(itemRepository.saveAll(anyList())).thenAnswer(invocation -> {
            List<DesafioItem> itens = invocation.getArgument(0);
            long proximoId = 1L;
            for (DesafioItem item : itens) {
                ReflectionTestUtils.setField(item, "id", proximoId++);
            }
            return itens;
        });
    }

    private Desafio capturarDesafio() {
        ArgumentCaptor<Desafio> captor = ArgumentCaptor.forClass(Desafio.class);
        verify(desafioRepository).saveAndFlush(captor.capture());
        return captor.getValue();
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private List<DesafioItem> capturarItens() {
        ArgumentCaptor<List> captor = ArgumentCaptor.forClass(List.class);
        verify(itemRepository).saveAll(captor.capture());
        return (List<DesafioItem>) captor.getValue();
    }

    private DesafioItemRequestDTO supinoMeta() {
        return new DesafioItemRequestDTO(SUPINO_ID, new BigDecimal("80"), 100, 3, null, null);
    }

    private DesafioItemRequestDTO corridaMeta() {
        return new DesafioItemRequestDTO(CORRIDA_ID, null, null, null, 1800, new BigDecimal("5000"));
    }

    private CatalogoExercicio catalogo(Long id, String nome, Modalidade modalidade) {
        CatalogoExercicio catalogo = new CatalogoExercicio(nome, modalidade, "Peito");
        ReflectionTestUtils.setField(catalogo, "id", id);
        return catalogo;
    }

    private Desafio desafio(Long id, Long criadorId) {
        Desafio desafio = new Desafio(criadorId, "Desafio das 100 repetições", LocalDate.of(2026, 12, 15));
        ReflectionTestUtils.setField(desafio, "id", id);
        return desafio;
    }

    private Desafio desafioPublico(Long id, Long criadorId) {
        Desafio desafio = new Desafio(criadorId, "Desafio público", LocalDate.of(2026, 12, 15), "Descrição pública", Visibilidade.PUBLICO);
        ReflectionTestUtils.setField(desafio, "id", id);
        return desafio;
    }

    private DesafioItem item(Long id, Long desafioId, Long catalogoId) {
        DesafioItem item = new DesafioItem();
        ReflectionTestUtils.setField(item, "id", id);
        item.setDesafioId(desafioId);
        item.setCatalogoId(catalogoId);
        item.setMetaRepeticoes(100);
        return item;
    }

    private DesafioParticipante participante(Long desafioId, Long usuarioId, EstadoParticipante estado) {
        DesafioParticipante p = new DesafioParticipante();
        p.setDesafioId(desafioId);
        p.setUsuarioId(usuarioId);
        p.setEstado(estado);
        return p;
    }

    private Usuario usuario(Long id, String email) {
        Usuario u = new Usuario();
        ReflectionTestUtils.setField(u, "id", id);
        u.setEmail(email);
        return u;
    }

    // --- Testes de participantes ---

    @Test
    void listaParticipantesDoDesafio() {
        Desafio proprio = desafio(DESAFIO_ID, USUARIO_ID);
        when(desafioRepository.findVisivelPorId(DESAFIO_ID, USUARIO_ID, EstadoDesafio.ATIVO, Visibilidade.PUBLICO))
                .thenReturn(Optional.of(proprio));

        List<DesafioParticipante> participantes = List.of(
                participante(DESAFIO_ID, USUARIO_ID, EstadoParticipante.ACEITO),
                participante(DESAFIO_ID, OUTRO_USUARIO_ID, EstadoParticipante.CONVIDADO));
        when(participanteRepository.findAllByDesafioId(DESAFIO_ID)).thenReturn(participantes);

        when(usuarioRepository.findAllById(List.of(USUARIO_ID, OUTRO_USUARIO_ID)))
                .thenReturn(List.of(usuario(USUARIO_ID, "eu@motivafit.com"), usuario(OUTRO_USUARIO_ID, "amigo@motivafit.com")));

        List<DesafioParticipanteResponseDTO> response = service.findParticipantes(USUARIO_ID, DESAFIO_ID);

        assertEquals(2, response.size());
        assertEquals(USUARIO_ID, response.get(0).usuarioId());
        assertEquals("eu@motivafit.com", response.get(0).email());
        assertEquals(EstadoParticipante.ACEITO, response.get(0).estado());
        assertEquals(OUTRO_USUARIO_ID, response.get(1).usuarioId());
        assertEquals(EstadoParticipante.CONVIDADO, response.get(1).estado());
    }

    @Test
    void listarParticipantesDesafioNaoVisivelGeraNaoEncontrado() {
        when(desafioRepository.findVisivelPorId(DESAFIO_ID, USUARIO_ID, EstadoDesafio.ATIVO, Visibilidade.PUBLICO))
                .thenReturn(Optional.empty());

        assertThrows(NaoEncontradoException.class, () -> service.findParticipantes(USUARIO_ID, DESAFIO_ID));
    }

    @Test
    void criadorAdicionaParticipante() {
        Desafio proprio = desafio(DESAFIO_ID, USUARIO_ID);
        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO)).thenReturn(Optional.of(proprio));
        when(participanteRepository.findByDesafioIdAndUsuarioId(DESAFIO_ID, OUTRO_USUARIO_ID))
                .thenReturn(Optional.empty());
        when(usuarioRepository.findById(OUTRO_USUARIO_ID)).thenReturn(Optional.of(usuario(OUTRO_USUARIO_ID, "amigo@motivafit.com")));

        DesafioParticipante salvo = participante(DESAFIO_ID, OUTRO_USUARIO_ID, EstadoParticipante.CONVIDADO);
        when(participanteRepository.save(any(DesafioParticipante.class))).thenReturn(salvo);

        DesafioParticipanteResponseDTO response = service.addParticipante(USUARIO_ID, DESAFIO_ID,
                new AdicionarParticipanteRequestDTO(OUTRO_USUARIO_ID));

        assertEquals(OUTRO_USUARIO_ID, response.usuarioId());
        assertEquals("amigo@motivafit.com", response.email());
        assertEquals(EstadoParticipante.CONVIDADO, response.estado());
    }

    @Test
    void naoCriadorNaoPodeAdicionarParticipante() {
        Desafio deOutro = desafio(DESAFIO_ID, OUTRO_USUARIO_ID);
        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO)).thenReturn(Optional.of(deOutro));

        AcessoNegadoException erro = assertThrows(AcessoNegadoException.class, () -> service.addParticipante(
                USUARIO_ID, DESAFIO_ID, new AdicionarParticipanteRequestDTO(99L)));

        assertEquals("DESAFIO_SOMENTE_CRIADOR", erro.getCodigo());
    }

    @Test
    void criadorNaoPodeSeAdicionar() {
        Desafio proprio = desafio(DESAFIO_ID, USUARIO_ID);
        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO)).thenReturn(Optional.of(proprio));

        ConflitoException erro = assertThrows(ConflitoException.class, () -> service.addParticipante(
                USUARIO_ID, DESAFIO_ID, new AdicionarParticipanteRequestDTO(USUARIO_ID)));

        assertEquals("CRIADOR_JA_PARTICIPANTE", erro.getCodigo());
    }

    @Test
    void participanteJaConvidadoGeraConflito() {
        Desafio proprio = desafio(DESAFIO_ID, USUARIO_ID);
        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO)).thenReturn(Optional.of(proprio));
        when(participanteRepository.findByDesafioIdAndUsuarioId(DESAFIO_ID, OUTRO_USUARIO_ID))
                .thenReturn(Optional.of(participante(DESAFIO_ID, OUTRO_USUARIO_ID, EstadoParticipante.CONVIDADO)));

        ConflitoException erro = assertThrows(ConflitoException.class, () -> service.addParticipante(
                USUARIO_ID, DESAFIO_ID, new AdicionarParticipanteRequestDTO(OUTRO_USUARIO_ID)));

        assertEquals("PARTICIPANTE_JA_EXISTE", erro.getCodigo());
    }

    @Test
    void usuarioNaoEncontradoGeraNaoEncontrado() {
        Desafio proprio = desafio(DESAFIO_ID, USUARIO_ID);
        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO)).thenReturn(Optional.of(proprio));
        when(participanteRepository.findByDesafioIdAndUsuarioId(DESAFIO_ID, OUTRO_USUARIO_ID))
                .thenReturn(Optional.empty());
        when(usuarioRepository.findById(OUTRO_USUARIO_ID)).thenReturn(Optional.empty());

        NaoEncontradoException erro = assertThrows(NaoEncontradoException.class, () -> service.addParticipante(
                USUARIO_ID, DESAFIO_ID, new AdicionarParticipanteRequestDTO(OUTRO_USUARIO_ID)));

        assertEquals("USUARIO_NAO_ENCONTRADO", erro.getCodigo());
    }

    @Test
    void usuarioAceitaParticipacao() {
        Desafio proprio = desafio(DESAFIO_ID, USUARIO_ID);
        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO)).thenReturn(Optional.of(proprio));

        DesafioParticipante participanteExistente = participante(DESAFIO_ID, USUARIO_ID, EstadoParticipante.CONVIDADO);
        when(participanteRepository.findByDesafioIdAndUsuarioId(DESAFIO_ID, USUARIO_ID))
                .thenReturn(Optional.of(participanteExistente));
        when(participanteRepository.save(any(DesafioParticipante.class))).thenReturn(participanteExistente);
        when(usuarioRepository.findById(USUARIO_ID)).thenReturn(Optional.of(usuario(USUARIO_ID, "eu@motivafit.com")));

        DesafioParticipanteResponseDTO response = service.updateMinhaParticipacao(USUARIO_ID, DESAFIO_ID,
                new ParticipanteUpdateRequestDTO(EstadoParticipante.ACEITO));

        assertEquals(EstadoParticipante.ACEITO, response.estado());
        assertEquals(EstadoParticipante.ACEITO, participanteExistente.getEstado());
        assertNotNull(participanteExistente.getAceitoEm());
    }

    @Test
    void usuarioRecusaParticipacao() {
        Desafio proprio = desafio(DESAFIO_ID, USUARIO_ID);
        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO)).thenReturn(Optional.of(proprio));

        DesafioParticipante participanteExistente = participante(DESAFIO_ID, USUARIO_ID, EstadoParticipante.CONVIDADO);
        when(participanteRepository.findByDesafioIdAndUsuarioId(DESAFIO_ID, USUARIO_ID))
                .thenReturn(Optional.of(participanteExistente));
        when(participanteRepository.save(any(DesafioParticipante.class))).thenReturn(participanteExistente);
        when(usuarioRepository.findById(USUARIO_ID)).thenReturn(Optional.of(usuario(USUARIO_ID, "eu@motivafit.com")));

        DesafioParticipanteResponseDTO response = service.updateMinhaParticipacao(USUARIO_ID, DESAFIO_ID,
                new ParticipanteUpdateRequestDTO(EstadoParticipante.RECUSADO));

        assertEquals(EstadoParticipante.RECUSADO, response.estado());
    }

    @Test
    void naoParticipanteNaoPodeAtualizar() {
        Desafio proprio = desafio(DESAFIO_ID, USUARIO_ID);
        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO)).thenReturn(Optional.of(proprio));
        when(participanteRepository.findByDesafioIdAndUsuarioId(DESAFIO_ID, USUARIO_ID))
                .thenReturn(Optional.empty());

        NaoEncontradoException erro = assertThrows(NaoEncontradoException.class, () -> service.updateMinhaParticipacao(
                USUARIO_ID, DESAFIO_ID, new ParticipanteUpdateRequestDTO(EstadoParticipante.ACEITO)));

        assertEquals("NAO_PARTICIPANTE", erro.getCodigo());
    }

    @Test
    void estadoInvalidoGeraRequisicaoInvalida() {
        Desafio proprio = desafio(DESAFIO_ID, USUARIO_ID);
        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO)).thenReturn(Optional.of(proprio));
        when(participanteRepository.findByDesafioIdAndUsuarioId(DESAFIO_ID, USUARIO_ID))
                .thenReturn(Optional.of(participante(DESAFIO_ID, USUARIO_ID, EstadoParticipante.CONVIDADO)));

        // CONVIDADO não é um estado válido para update — só ACEITO ou RECUSADO
        RequisicaoInvalidaException erro = assertThrows(RequisicaoInvalidaException.class, () -> service.updateMinhaParticipacao(
                USUARIO_ID, DESAFIO_ID, new ParticipanteUpdateRequestDTO(EstadoParticipante.CONVIDADO)));

        assertEquals("ESTADO_INVALIDO", erro.getCodigo());
    }

    @Test
    void participanteSaiDoDesafio() {
        Desafio deOutro = desafio(DESAFIO_ID, OUTRO_USUARIO_ID);
        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO)).thenReturn(Optional.of(deOutro));

        DesafioParticipante participanteExistente = participante(DESAFIO_ID, USUARIO_ID, EstadoParticipante.ACEITO);
        when(participanteRepository.findByDesafioIdAndUsuarioId(DESAFIO_ID, USUARIO_ID))
                .thenReturn(Optional.of(participanteExistente));

        service.deleteMinhaParticipacao(USUARIO_ID, DESAFIO_ID);

        verify(participanteRepository).delete(participanteExistente);
    }

    @Test
    void criadorNaoPodeSairDoDesafio() {
        Desafio proprio = desafio(DESAFIO_ID, USUARIO_ID);
        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO)).thenReturn(Optional.of(proprio));

        AcessoNegadoException erro = assertThrows(AcessoNegadoException.class,
                () -> service.deleteMinhaParticipacao(USUARIO_ID, DESAFIO_ID));

        assertEquals("CRIADOR_NAO_SAI", erro.getCodigo());
        verify(participanteRepository, never()).delete(any());
    }

    @Test
    void naoParticipanteNaoPodeSair() {
        Desafio deOutro = desafio(DESAFIO_ID, OUTRO_USUARIO_ID);
        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO)).thenReturn(Optional.of(deOutro));
        when(participanteRepository.findByDesafioIdAndUsuarioId(DESAFIO_ID, USUARIO_ID))
                .thenReturn(Optional.empty());

        NaoEncontradoException erro = assertThrows(NaoEncontradoException.class,
                () -> service.deleteMinhaParticipacao(USUARIO_ID, DESAFIO_ID));

        assertEquals("NAO_PARTICIPANTE", erro.getCodigo());
    }

    // --- Integração com o frontend: entrada direta e progresso ---

    @Test
    void convidadoQueEntraEmDesafioPublicoPassaParaAceito() {
        Desafio publico = desafioPublico(DESAFIO_ID, OUTRO_USUARIO_ID);
        DesafioParticipante convite = participante(DESAFIO_ID, USUARIO_ID, EstadoParticipante.CONVIDADO);
        Usuario usuario = new Usuario();
        usuario.setId(USUARIO_ID);
        usuario.setEmail("aluno@test.com");
        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO)).thenReturn(Optional.of(publico));
        when(participanteRepository.findByDesafioIdAndUsuarioId(DESAFIO_ID, USUARIO_ID)).thenReturn(Optional.of(convite));
        when(participanteRepository.save(any(DesafioParticipante.class))).thenAnswer(inv -> inv.getArgument(0));
        when(usuarioRepository.findById(USUARIO_ID)).thenReturn(Optional.of(usuario));

        DesafioParticipanteResponseDTO resposta = service.entrar(USUARIO_ID, DESAFIO_ID);

        assertEquals(EstadoParticipante.ACEITO, resposta.estado());
        assertNotNull(resposta.aceitoEm());
    }

    @Test
    void naoEntraEmDesafioPrivado() {
        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO))
                .thenReturn(Optional.of(desafio(DESAFIO_ID, OUTRO_USUARIO_ID)));

        assertThrows(NaoEncontradoException.class, () -> service.entrar(USUARIO_ID, DESAFIO_ID));
        verify(participanteRepository, never()).save(any());
    }

    @Test
    void progressoSemRegistrosFicaZeradoEOrdenaPorPercentual() {
        Desafio desafio = desafioPublico(DESAFIO_ID, USUARIO_ID);
        ReflectionTestUtils.setField(desafio, "createdAt", java.time.OffsetDateTime.parse("2026-11-01T10:00:00-03:00"));
        DesafioItem meta = item(5L, DESAFIO_ID, SUPINO_ID);
        Usuario criador = new Usuario();
        criador.setId(USUARIO_ID);
        criador.setEmail("criador@test.com");
        Usuario outro = new Usuario();
        outro.setId(OUTRO_USUARIO_ID);
        outro.setEmail("outro@test.com");
        when(desafioRepository.findVisivelPorId(DESAFIO_ID, USUARIO_ID, EstadoDesafio.ATIVO, Visibilidade.PUBLICO))
                .thenReturn(Optional.of(desafio));
        when(itemRepository.findAllByDesafioId(DESAFIO_ID)).thenReturn(List.of(meta));
        when(participanteRepository.findAllByDesafioId(DESAFIO_ID)).thenReturn(List.of(
                participante(DESAFIO_ID, USUARIO_ID, EstadoParticipante.ACEITO),
                participante(DESAFIO_ID, OUTRO_USUARIO_ID, EstadoParticipante.ACEITO),
                participante(DESAFIO_ID, 55L, EstadoParticipante.CONVIDADO)));
        when(usuarioRepository.findAllById(any())).thenReturn(List.of(criador, outro));
        List<Object[]> somas = new java.util.ArrayList<>();
        somas.add(new Object[]{OUTRO_USUARIO_ID, SUPINO_ID, null, 150L, 10L, 0L, BigDecimal.ZERO});
        when(registroRepository.somarPorUsuarioECatalogo(any(), any(), any(), any())).thenReturn(somas);

        var progresso = service.progresso(USUARIO_ID, DESAFIO_ID);

        assertEquals(2, progresso.size());
        assertEquals(OUTRO_USUARIO_ID, progresso.get(0).usuarioId());
        assertEquals(0, new BigDecimal("100").compareTo(progresso.get(0).percentual()));
        assertTrue(progresso.get(0).concluido());
        assertEquals(USUARIO_ID, progresso.get(1).usuarioId());
        assertEquals(0, BigDecimal.ZERO.compareTo(progresso.get(1).percentual()));
        assertFalse(progresso.get(1).itens().get(0).concluido());
    }

    @Test
    void atualizarSemVisibilidadeMantemAAtualESubstituiItens() {
        Desafio publico = desafioPublico(DESAFIO_ID, USUARIO_ID);
        when(desafioRepository.findByIdAndEstado(DESAFIO_ID, EstadoDesafio.ATIVO)).thenReturn(Optional.of(publico));
        when(catalogoRepository.findByIdAndAtivoTrue(SUPINO_ID)).thenReturn(Optional.of(catalogo(SUPINO_ID, "Supino", Modalidade.MUSCULACAO)));
        when(itemRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));

        DesafioResponseDTO resposta = service.update(USUARIO_ID, DESAFIO_ID, new DesafioRequestDTO(
                "Novo", LocalDate.now().plusDays(3), null, null,
                List.of(new DesafioItemRequestDTO(SUPINO_ID, null, 50, null, null, null))));

        assertEquals(Visibilidade.PUBLICO, resposta.visibilidade());
        verify(itemRepository).deleteAllByDesafioId(DESAFIO_ID);
        assertEquals(1, resposta.itens().size());
        assertEquals(50, resposta.itens().get(0).metaRepeticoes());
    }
}
