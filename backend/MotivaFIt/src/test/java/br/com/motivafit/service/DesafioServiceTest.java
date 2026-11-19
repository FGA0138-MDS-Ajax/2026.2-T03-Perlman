package br.com.motivafit.service;

import br.com.motivafit.dto.request.DesafioItemRequestDTO;
import br.com.motivafit.dto.request.DesafioRequestDTO;
import br.com.motivafit.dto.response.DesafioItemResponseDTO;
import br.com.motivafit.dto.response.DesafioResponseDTO;
import br.com.motivafit.entity.CatalogoExercicio;
import br.com.motivafit.entity.Desafio;
import br.com.motivafit.entity.DesafioItem;
import br.com.motivafit.entity.DesafioParticipante;
import br.com.motivafit.enums.EstadoDesafio;
import br.com.motivafit.enums.EstadoParticipante;
import br.com.motivafit.enums.Modalidade;
import br.com.motivafit.exception.AcessoNegadoException;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.exception.RequisicaoInvalidaException;
import br.com.motivafit.repository.CatalogoExercicioRepository;
import br.com.motivafit.repository.DesafioItemRepository;
import br.com.motivafit.repository.DesafioParticipanteRepository;
import br.com.motivafit.repository.DesafioRepository;
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
    private DesafioService service;

    @BeforeEach
    void setup() {
        desafioRepository = mock(DesafioRepository.class);
        itemRepository = mock(DesafioItemRepository.class);
        participanteRepository = mock(DesafioParticipanteRepository.class);
        catalogoRepository = mock(CatalogoExercicioRepository.class);
        service = new DesafioService(desafioRepository, itemRepository, participanteRepository, catalogoRepository);
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
    void listaOsDesafiosDoUsuarioComSeusExercicios() {
        CatalogoExercicio supino = catalogo(SUPINO_ID, "Supino reto", Modalidade.MUSCULACAO);
        CatalogoExercicio corrida = catalogo(CORRIDA_ID, "Corrida", Modalidade.AEROBICO);
        Desafio proprio = desafio(DESAFIO_ID, USUARIO_ID);
        Desafio deOutro = desafio(101L, OUTRO_USUARIO_ID);
        Desafio semItens = desafio(102L, USUARIO_ID);
        when(desafioRepository.findVisiveisDoUsuario(USUARIO_ID, EstadoDesafio.ATIVO, EstadoParticipante.RECUSADO))
                .thenReturn(List.of(proprio, deOutro, semItens));
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
        assertEquals(102L, response.get(2).id());
        assertTrue(response.get(2).itens().isEmpty());
    }

    @Test
    void listaVaziaQuandoOUsuarioNaoParticipaDeNenhumDesafio() {
        when(desafioRepository.findVisiveisDoUsuario(USUARIO_ID, EstadoDesafio.ATIVO, EstadoParticipante.RECUSADO))
                .thenReturn(List.of());

        assertTrue(service.findAll(USUARIO_ID).isEmpty());
        verifyNoInteractions(itemRepository, catalogoRepository);
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

    private DesafioItem item(Long id, Long desafioId, Long catalogoId) {
        DesafioItem item = new DesafioItem();
        ReflectionTestUtils.setField(item, "id", id);
        item.setDesafioId(desafioId);
        item.setCatalogoId(catalogoId);
        item.setMetaRepeticoes(100);
        return item;
    }
}