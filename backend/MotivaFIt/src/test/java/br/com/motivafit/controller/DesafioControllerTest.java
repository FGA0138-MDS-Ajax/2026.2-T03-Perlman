package br.com.motivafit.controller;

import br.com.motivafit.dto.request.DesafioItemRequestDTO;
import br.com.motivafit.dto.request.DesafioRequestDTO;
import br.com.motivafit.dto.response.DesafioResponseDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.EstadoDesafio;
import br.com.motivafit.service.DesafioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DesafioControllerTest {
    private static final Long USUARIO_ID = 7L;
    private static final Long DESAFIO_ID = 100L;

    private DesafioService service;
    private DesafioController controller;
    private Usuario usuario;

    @BeforeEach
    void setup() {
        service = mock(DesafioService.class);
        controller = new DesafioController(service);
        usuario = mock(Usuario.class);
        when(usuario.getId()).thenReturn(USUARIO_ID);
    }

    @Test
    void cadastroRetorna201ComODesafioDoUsuarioAutenticado() {
        var request = new DesafioRequestDTO("Desafio", LocalDate.of(2026, 12, 15),
                List.of(new DesafioItemRequestDTO(1L, null, 100, null, null, null)));
        DesafioResponseDTO dto = resposta();
        when(service.create(USUARIO_ID, request)).thenReturn(dto);

        var response = controller.create(usuario, request);

        assertEquals(201, response.getStatusCode().value());
        assertSame(dto, response.getBody());
        verify(service).create(USUARIO_ID, request);
    }

    @Test
    void listagemRetorna200ComOsDesafiosDoUsuario() {
        List<DesafioResponseDTO> lista = List.of(resposta());
        when(service.findAll(USUARIO_ID)).thenReturn(lista);

        var response = controller.findAll(usuario);

        assertEquals(200, response.getStatusCode().value());
        assertSame(lista, response.getBody());
    }

    @Test
    void remocaoRetorna204SemCorpo() {
        var response = controller.delete(usuario, DESAFIO_ID);

        assertEquals(204, response.getStatusCode().value());
        assertNull(response.getBody());
        verify(service).delete(USUARIO_ID, DESAFIO_ID);
    }

    private DesafioResponseDTO resposta() {
        return new DesafioResponseDTO(DESAFIO_ID, "Desafio", LocalDate.of(2026, 12, 15),
                EstadoDesafio.ATIVO, true, List.of());
    }
}