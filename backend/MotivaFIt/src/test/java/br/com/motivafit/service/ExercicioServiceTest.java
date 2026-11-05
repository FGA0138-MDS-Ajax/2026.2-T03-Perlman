package br.com.motivafit.service;

import br.com.motivafit.dto.mapper.ExercicioMapper;
import br.com.motivafit.dto.request.ExercicioRequestDTO;
import br.com.motivafit.entity.CatalogoExercicio;
import br.com.motivafit.entity.Exercicio;
import br.com.motivafit.entity.Treino;
import br.com.motivafit.enums.Modalidade;
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
    void listaExerciciosDoTreinoMapeados() {
        Treino treino = treino(4L);
        CatalogoExercicio catalogo = catalogo(9L);
        Exercicio exercicio = exercicio(treino, catalogo);
        exercicio.setId(7L);
        when(exercicioRepository.findByTreinoId(4L)).thenReturn(List.of(exercicio));

        var resposta = service.listarPorTreinoId(4L);

        assertEquals(1, resposta.size());
        assertEquals(7L, resposta.getFirst().id());
        assertEquals(4L, resposta.getFirst().treinoId());
        assertEquals(9L, resposta.getFirst().catalogoExercicioId());
    }

    @Test
    void retornaListaVaziaQuandoTreinoNaoTemExercicios() {
        when(exercicioRepository.findByTreinoId(4L)).thenReturn(List.of());

        assertTrue(service.listarPorTreinoId(4L).isEmpty());
    }

    @Test
    void adicionaExercicioAssociandoTreinoECatalogo() {
        Treino treino = treino(4L);
        CatalogoExercicio catalogo = catalogo(9L);
        when(treinoRepository.findById(4L)).thenReturn(Optional.of(treino));
        when(catalogoRepository.findById(9L)).thenReturn(Optional.of(catalogo));
        when(exercicioRepository.save(any(Exercicio.class))).thenAnswer(invocation -> {
            Exercicio salvo = invocation.getArgument(0);
            salvo.setId(12L);
            return salvo;
        });

        var resposta = service.adicionarExercicio(4L, new ExercicioRequestDTO("3 séries", "50 kg", 4L, 9L));

        assertEquals(12L, resposta.id());
        assertEquals("3 séries", resposta.meta());
        assertEquals("50 kg", resposta.metaRecorde());
        assertEquals(4L, resposta.treinoId());
        assertEquals(9L, resposta.catalogoExercicioId());
    }

    @Test
    void treinoInexistenteImpedeCriacao() {
        when(treinoRepository.findById(4L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.adicionarExercicio(
                4L, new ExercicioRequestDTO("3 séries", null, 4L, 9L)));

        verifyNoInteractions(catalogoRepository);
        verify(exercicioRepository, never()).save(any());
    }

    @Test
    void catalogoInexistenteImpedeCriacao() {
        when(treinoRepository.findById(4L)).thenReturn(Optional.of(treino(4L)));
        when(catalogoRepository.findById(9L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.adicionarExercicio(
                4L, new ExercicioRequestDTO("3 séries", null, 4L, 9L)));

        verify(exercicioRepository, never()).save(any());
    }

    private Treino treino(Long id) {
        Treino treino = new Treino();
        ReflectionTestUtils.setField(treino, "id", id);
        return treino;
    }

    private CatalogoExercicio catalogo(Long id) {
        CatalogoExercicio catalogo = new CatalogoExercicio("Supino", Modalidade.MUSCULACAO, "Peito");
        ReflectionTestUtils.setField(catalogo, "id", id);
        return catalogo;
    }

    private Exercicio exercicio(Treino treino, CatalogoExercicio catalogo) {
        Exercicio exercicio = new Exercicio();
        exercicio.setMeta("Meta");
        exercicio.setTreino(treino);
        exercicio.setCatalogoExercicio(catalogo);
        return exercicio;
    }
}
