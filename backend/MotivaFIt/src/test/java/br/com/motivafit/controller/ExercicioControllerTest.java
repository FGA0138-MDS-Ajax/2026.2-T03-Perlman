package br.com.motivafit.controller;

import br.com.motivafit.dto.request.ExercicioRequestDTO;
import br.com.motivafit.dto.response.ExercicioResponseDTO;
import br.com.motivafit.service.ExercicioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ExercicioControllerTest {
    private ExercicioService service;
    private ExercicioController controller;

    @BeforeEach
    void setUp() {
        service = mock(ExercicioService.class);
        controller = new ExercicioController(service);
    }

    @Test
    void listaExerciciosRetorna200EConteudoDoServico() {
        List<ExercicioResponseDTO> exercicios = List.of(new ExercicioResponseDTO(3L, "3 séries", null, 1L, 2L));
        when(service.listarPorTreinoId(1L)).thenReturn(exercicios);

        var response = controller.listarExercicios(1L);

        assertEquals(200, response.getStatusCode().value());
        assertSame(exercicios, response.getBody());
    }

    @Test
    void adicionaExercicioRetorna201EConteudoCriado() {
        var request = new ExercicioRequestDTO("3 séries", null, 1L, 2L);
        var criado = new ExercicioResponseDTO(3L, "3 séries", null, 1L, 2L);
        when(service.adicionarExercicio(1L, request)).thenReturn(criado);

        var response = controller.adicionarExercicio(1L, request);

        assertEquals(201, response.getStatusCode().value());
        assertSame(criado, response.getBody());
    }
}
