package br.com.motivafit.controller;

import br.com.motivafit.dto.response.CatalogoExercicioResponseDTO;
import br.com.motivafit.enums.Modalidade;
import br.com.motivafit.service.CatalogoExercicioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CatalogoExercicioControllerTest {
    private CatalogoExercicioService service;
    private CatalogoExercicioController controller;

    @BeforeEach
    void setup() {
        service = mock(CatalogoExercicioService.class);
        controller = new CatalogoExercicioController(service);
    }

    @Test
    void listagemRetorna200ComOsExercicios() {
        List<CatalogoExercicioResponseDTO> lista = List.of(
                new CatalogoExercicioResponseDTO(1L, "Corrida", Modalidade.AEROBICO, "Cardio"));
        when(service.findAll()).thenReturn(lista);

        var response = controller.findAll();

        assertEquals(200, response.getStatusCode().value());
        assertSame(lista, response.getBody());
    }

    @Test
    void buscaPorIdRetorna200() {
        var dto = new CatalogoExercicioResponseDTO(2L, "Supino reto", Modalidade.MUSCULACAO, "Peito");
        when(service.findById(2L)).thenReturn(dto);

        var response = controller.findById(2L);

        assertEquals(200, response.getStatusCode().value());
        assertSame(dto, response.getBody());
    }
}