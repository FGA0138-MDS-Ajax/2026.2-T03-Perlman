package br.com.motivafit.controller;

import br.com.motivafit.dto.request.ExercicioRequestDTO;
import br.com.motivafit.dto.response.ExercicioResponseDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.service.ExercicioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ExercicioControllerTest {
    private ExercicioService service;
    private ExercicioController controller;
    private Usuario usuario;

    @BeforeEach
    void setUp() {
        service = mock(ExercicioService.class);
        controller = new ExercicioController(service);
        usuario = mock(Usuario.class);
        when(usuario.getId()).thenReturn(5L);
    }

    @Test
    void listaExerciciosRetorna200EConteudoDoServico() {
        List<ExercicioResponseDTO> exercicios = List.of(new ExercicioResponseDTO(3L, "3 séries", null, 1L, 2L));
        when(service.listar(5L, 1L)).thenReturn(exercicios);

        var response = controller.listar(usuario, 1L);

        assertEquals(200, response.getStatusCode().value());
        assertSame(exercicios, response.getBody());
    }

    @Test
    void adicionaExercicioRetorna201EConteudoCriado() {
        var request = new ExercicioRequestDTO("3 séries", null, 1L, 2L);
        var criado = new ExercicioResponseDTO(3L, "3 séries", null, 1L, 2L);
        when(service.adicionar(5L, 1L, request)).thenReturn(criado);

        var response = controller.adicionar(usuario, 1L, request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertSame(criado, response.getBody());
    }

    @Test
    void alteraExercicioRetorna200() {
        var request = new ExercicioRequestDTO("4 séries", null, 1L, 2L);
        var alterado = new ExercicioResponseDTO(3L, "4 séries", null, 1L, 2L);
        when(service.alterar(5L, 1L, 3L, request)).thenReturn(alterado);

        var response = controller.alterar(usuario, 1L, 3L, request);

        assertEquals(200, response.getStatusCode().value());
        assertSame(alterado, response.getBody());
    }

    @Test
    void removeExercicioRetorna204() {
        var response = controller.remover(usuario, 1L, 3L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(service).remover(5L, 1L, 3L);
    }
}
