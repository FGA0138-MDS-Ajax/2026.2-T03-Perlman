package br.com.motivafit.service;

import br.com.motivafit.dto.mapper.ExercicioMapper;
import br.com.motivafit.dto.request.ExercicioRequestDTO;
import br.com.motivafit.entity.CatalogoExercicio;
import br.com.motivafit.entity.Exercicio;
import br.com.motivafit.entity.Treino;
import br.com.motivafit.enums.Modalidade;
import br.com.motivafit.enums.Visibilidade;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.exception.RequisicaoInvalidaException;
import br.com.motivafit.repository.CatalogoExercicioRepository;
import br.com.motivafit.repository.ExercicioRepository;
import br.com.motivafit.repository.TreinoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ExercicioServiceTest {
    private static final Long USUARIO_ID = 5L;
    private static final Long OUTRO_USUARIO_ID = 9L;
    private static final Long TREINO_ID = 4L;

    private ExercicioRepository exercicioRepository;
    private TreinoRepository treinoRepository;
    private CatalogoExercicioRepository catalogoRepository;
    private ExercicioService service;

    @BeforeEach
    void setUp() {
        exercicioRepository = mock(ExercicioRepository.class);
        treinoRepository = mock(TreinoRepository.class);
        catalogoRepository = mock(CatalogoExercicioRepository.class);
        service = new ExercicioService(exercicioRepository, treinoRepository, catalogoRepository, new ExercicioMapper());
    }

    @Test
    void listaExerciciosDoTreinoVisivelEmOrdemDeInclusao() {
        Treino treino = treino(TREINO_ID, USUARIO_ID);
        Exercicio exercicio = exercicio(7L, treino, catalogo(9L), "Meta");
        when(treinoRepository.findByIdEUsuarioOuPublico(TREINO_ID, USUARIO_ID, Visibilidade.PUBLICO))
                .thenReturn(Optional.of(treino));
        when(exercicioRepository.findByTreinoIdOrderByIdAsc(TREINO_ID)).thenReturn(List.of(exercicio));

        var resposta = service.listar(USUARIO_ID, TREINO_ID);

        assertEquals(1, resposta.size());
        assertEquals(7L, resposta.getFirst().id());
        assertEquals(TREINO_ID, resposta.getFirst().treinoId());
        assertEquals(9L, resposta.getFirst().catalogoExercicioId());
    }

    @Test
    void listaPublicoDeOutraPessoaSemPermitirQueAConsultaVejaTreinoPrivado() {
        when(treinoRepository.findByIdEUsuarioOuPublico(TREINO_ID, USUARIO_ID, Visibilidade.PUBLICO))
                .thenReturn(Optional.empty());

        NaoEncontradoException erro = assertThrows(NaoEncontradoException.class,
                () -> service.listar(USUARIO_ID, TREINO_ID));

        assertEquals("TREINO_NAO_ENCONTRADO", erro.getCodigo());
        verifyNoInteractions(exercicioRepository);
    }

    @Test
    void adicionaExercicioAtivoSomenteNoTreinoDoUsuario() {
        Treino treino = treino(TREINO_ID, USUARIO_ID);
        CatalogoExercicio catalogo = catalogo(9L);
        when(treinoRepository.findByIdAndUsuarioIdAndExcluidoEmIsNull(TREINO_ID, USUARIO_ID))
                .thenReturn(Optional.of(treino));
        when(catalogoRepository.findByIdAndAtivoTrue(9L)).thenReturn(Optional.of(catalogo));
        when(exercicioRepository.save(any(Exercicio.class))).thenAnswer(invocation -> {
            Exercicio salvo = invocation.getArgument(0);
            salvo.setId(12L);
            return salvo;
        });

        var resposta = service.adicionar(USUARIO_ID, TREINO_ID,
                new ExercicioRequestDTO("  3 séries  ", "  50 kg  ", TREINO_ID, 9L));

        assertEquals(12L, resposta.id());
        assertEquals("3 séries", resposta.meta());
        assertEquals("50 kg", resposta.metaRecorde());
        assertEquals(9L, resposta.catalogoExercicioId());
    }

    @Test
    void recordeEmBrancoEhGravadoComoNulo() {
        prepararInclusao();
        when(exercicioRepository.save(any(Exercicio.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var resposta = service.adicionar(USUARIO_ID, TREINO_ID,
                new ExercicioRequestDTO("3 séries", "   ", TREINO_ID, 9L));

        assertNull(resposta.metaRecorde());
    }

    @Test
    void treinoDivergenteNaoGravaAssociacao() {
        assertThrows(RequisicaoInvalidaException.class, () -> service.adicionar(USUARIO_ID, TREINO_ID,
                new ExercicioRequestDTO("3 séries", null, 99L, 9L)));

        verify(exercicioRepository, never()).save(any());
    }

    @Test
    void treinoDeOutraPessoaNaoRecebeExercicio() {
        when(treinoRepository.findByIdAndUsuarioIdAndExcluidoEmIsNull(TREINO_ID, USUARIO_ID))
                .thenReturn(Optional.empty());

        NaoEncontradoException erro = assertThrows(NaoEncontradoException.class, () -> service.adicionar(
                USUARIO_ID, TREINO_ID, new ExercicioRequestDTO("3 séries", null, TREINO_ID, 9L)));

        assertEquals("TREINO_NAO_ENCONTRADO", erro.getCodigo());
        verify(exercicioRepository, never()).save(any());
    }

    @Test
    void catalogoInativoOuInexistenteNaoEntraNaFicha() {
        when(treinoRepository.findByIdAndUsuarioIdAndExcluidoEmIsNull(TREINO_ID, USUARIO_ID))
                .thenReturn(Optional.of(treino(TREINO_ID, USUARIO_ID)));
        when(catalogoRepository.findByIdAndAtivoTrue(9L)).thenReturn(Optional.empty());

        NaoEncontradoException erro = assertThrows(NaoEncontradoException.class, () -> service.adicionar(
                USUARIO_ID, TREINO_ID, new ExercicioRequestDTO("3 séries", null, TREINO_ID, 9L)));

        assertEquals("CATALOGO_NAO_ENCONTRADO", erro.getCodigo());
        verify(exercicioRepository, never()).save(any());
    }

    @Test
    void alteraMetaSemTrocarOItemDoCatalogo() {
        Exercicio exercicio = exercicio(7L, treino(TREINO_ID, USUARIO_ID), catalogo(9L), "3 séries");
        when(treinoRepository.findByIdAndUsuarioIdAndExcluidoEmIsNull(TREINO_ID, USUARIO_ID))
                .thenReturn(Optional.of(exercicio.getTreino()));
        when(exercicioRepository.findByIdAndTreinoId(7L, TREINO_ID)).thenReturn(Optional.of(exercicio));
        when(exercicioRepository.save(exercicio)).thenReturn(exercicio);

        var resposta = service.alterar(USUARIO_ID, TREINO_ID, 7L,
                new ExercicioRequestDTO("4 séries", null, TREINO_ID, 9L));

        assertEquals("4 séries", resposta.meta());
        assertNull(resposta.metaRecorde());
        assertEquals(9L, resposta.catalogoExercicioId());
    }

    @Test
    void trocaDeCatalogoNaAssociacaoEhRecusada() {
        Exercicio exercicio = exercicio(7L, treino(TREINO_ID, USUARIO_ID), catalogo(9L), "3 séries");
        when(treinoRepository.findByIdAndUsuarioIdAndExcluidoEmIsNull(TREINO_ID, USUARIO_ID))
                .thenReturn(Optional.of(exercicio.getTreino()));
        when(exercicioRepository.findByIdAndTreinoId(7L, TREINO_ID)).thenReturn(Optional.of(exercicio));

        RequisicaoInvalidaException erro = assertThrows(RequisicaoInvalidaException.class, () -> service.alterar(
                USUARIO_ID, TREINO_ID, 7L, new ExercicioRequestDTO("4 séries", null, TREINO_ID, 3L)));

        assertEquals("CATALOGO_DIVERGENTE", erro.getCodigo());
        assertEquals("3 séries", exercicio.getMeta());
        verify(exercicioRepository, never()).save(any());
    }

    @Test
    void removeAssociacaoDoProprioTreino() {
        Exercicio exercicio = exercicio(7L, treino(TREINO_ID, USUARIO_ID), catalogo(9L), "3 séries");
        when(treinoRepository.findByIdAndUsuarioIdAndExcluidoEmIsNull(TREINO_ID, USUARIO_ID))
                .thenReturn(Optional.of(exercicio.getTreino()));
        when(exercicioRepository.findByIdAndTreinoId(7L, TREINO_ID)).thenReturn(Optional.of(exercicio));

        service.remover(USUARIO_ID, TREINO_ID, 7L);

        verify(exercicioRepository).delete(exercicio);
    }

    @Test
    void naoRemoveExercicioDeTreinoAlheioNemAssociacaoDeOutraFicha() {
        when(treinoRepository.findByIdAndUsuarioIdAndExcluidoEmIsNull(TREINO_ID, USUARIO_ID))
                .thenReturn(Optional.of(treino(TREINO_ID, USUARIO_ID)));
        when(exercicioRepository.findByIdAndTreinoId(7L, TREINO_ID)).thenReturn(Optional.empty());

        NaoEncontradoException erro = assertThrows(NaoEncontradoException.class,
                () -> service.remover(USUARIO_ID, TREINO_ID, 7L));

        assertEquals("EXERCICIO_NAO_ENCONTRADO", erro.getCodigo());
        verify(exercicioRepository, never()).delete(any());
    }

    @Test
    void outraContaNaoRemoveAssociacao() {
        when(treinoRepository.findByIdAndUsuarioIdAndExcluidoEmIsNull(TREINO_ID, OUTRO_USUARIO_ID))
                .thenReturn(Optional.empty());

        assertThrows(NaoEncontradoException.class, () -> service.remover(OUTRO_USUARIO_ID, TREINO_ID, 7L));

        verify(exercicioRepository, never()).delete(any());
    }

    private void prepararInclusao() {
        when(treinoRepository.findByIdAndUsuarioIdAndExcluidoEmIsNull(TREINO_ID, USUARIO_ID))
                .thenReturn(Optional.of(treino(TREINO_ID, USUARIO_ID)));
        when(catalogoRepository.findByIdAndAtivoTrue(9L)).thenReturn(Optional.of(catalogo(9L)));
    }

    private Treino treino(Long id, Long usuarioId) {
        Treino treino = new Treino();
        ReflectionTestUtils.setField(treino, "id", id);
        treino.setUsuarioId(usuarioId);
        return treino;
    }

    private CatalogoExercicio catalogo(Long id) {
        CatalogoExercicio catalogo = new CatalogoExercicio("Supino", Modalidade.MUSCULACAO, "Peito");
        ReflectionTestUtils.setField(catalogo, "id", id);
        return catalogo;
    }

    private Exercicio exercicio(Long id, Treino treino, CatalogoExercicio catalogo, String meta) {
        Exercicio exercicio = new Exercicio();
        exercicio.setId(id);
        exercicio.setMeta(meta);
        exercicio.setTreino(treino);
        exercicio.setCatalogoExercicio(catalogo);
        return exercicio;
    }
}
