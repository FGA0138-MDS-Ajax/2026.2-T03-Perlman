package br.com.motivafit.service;

import br.com.motivafit.dto.response.CatalogoExercicioResponseDTO;
import br.com.motivafit.entity.CatalogoExercicio;
import br.com.motivafit.enums.Modalidade;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.repository.CatalogoExercicioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CatalogoExercicioServiceTest {
    private CatalogoExercicioRepository repository;
    private CatalogoExercicioService service;

    @BeforeEach
    void setup() {
        repository = mock(CatalogoExercicioRepository.class);
        service = new CatalogoExercicioService(repository);
    }

    @Test
    void listaOsExerciciosAtivosNaOrdemDoRepositorio() {
        when(repository.findAllByAtivoTrueOrderByNomeAsc()).thenReturn(List.of(
                exercicio(1L, "Corrida", Modalidade.AEROBICO, "Cardio"),
                exercicio(2L, "Supino reto", Modalidade.MUSCULACAO, "Peito")));

        List<CatalogoExercicioResponseDTO> response = service.findAll();

        assertEquals(2, response.size());
        assertEquals("Corrida", response.get(0).nome());
        assertEquals(Modalidade.AEROBICO, response.get(0).modalidade());
        assertEquals(2L, response.get(1).id());
        assertEquals("Peito", response.get(1).grupoMuscular());
    }

    @Test
    void listaVaziaQuandoNaoHaExerciciosAtivos() {
        when(repository.findAllByAtivoTrueOrderByNomeAsc()).thenReturn(List.of());

        assertTrue(service.findAll().isEmpty());
    }

    @Test
    void buscaExercicioAtivoPorId() {
        when(repository.findByIdAndAtivoTrue(2L))
                .thenReturn(Optional.of(exercicio(2L, "Supino reto", Modalidade.MUSCULACAO, "Peito")));

        CatalogoExercicioResponseDTO response = service.findById(2L);

        assertEquals(2L, response.id());
        assertEquals("Supino reto", response.nome());
    }

    @Test
    void exercicioInexistenteOuDesativadoGeraNaoEncontrado() {
        when(repository.findByIdAndAtivoTrue(99L)).thenReturn(Optional.empty());

        NaoEncontradoException erro = assertThrows(NaoEncontradoException.class, () -> service.findById(99L));

        assertEquals("EXERCICIO_NAO_ENCONTRADO", erro.getCodigo());
        assertEquals("Exercício não encontrado", erro.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, erro.getStatus());
    }

    private CatalogoExercicio exercicio(Long id, String nome, Modalidade modalidade, String grupo) {
        CatalogoExercicio exercicio = new CatalogoExercicio(nome, modalidade, grupo);
        ReflectionTestUtils.setField(exercicio, "id", id);
        return exercicio;
    }
}