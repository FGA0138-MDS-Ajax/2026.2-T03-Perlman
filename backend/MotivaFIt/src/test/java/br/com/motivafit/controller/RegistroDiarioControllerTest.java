package br.com.motivafit.controller;

import br.com.motivafit.dto.request.RegistroDiarioRequestDTO;
import br.com.motivafit.dto.response.RegistroDiarioResponseDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.service.RegistroDiarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RegistroDiarioControllerTest {
    private static final Long USUARIO_ID = 7L;

    private RegistroDiarioService service;
    private RegistroDiarioController controller;
    private Usuario usuario;

    @BeforeEach
    void setup() {
        service = mock(RegistroDiarioService.class);
        controller = new RegistroDiarioController(service);
        usuario = mock(Usuario.class);
        when(usuario.getId()).thenReturn(USUARIO_ID);
    }

    @Test
    void cadastroRetorna201ComORegistroDoUsuarioAutenticado() {
        var request = new RegistroDiarioRequestDTO(1L, null, null, new BigDecimal("80"), 8, 3, 1200, null, null, null);
        RegistroDiarioResponseDTO dto = resposta(101L);
        when(service.create(USUARIO_ID, request)).thenReturn(dto);

        var response = controller.create(usuario, request);

        assertEquals(201, response.getStatusCode().value());
        assertSame(dto, response.getBody());
        verify(service).create(USUARIO_ID, request);
    }

    @Test
    void listagemRetorna200ComOsRegistrosDoUsuarioEAPaginaPedida() {
        List<RegistroDiarioResponseDTO> lista = List.of(resposta(102L), resposta(101L));
        when(service.findAll(USUARIO_ID, 1, 20)).thenReturn(lista);

        var response = controller.findAll(usuario, 1, 20);

        assertEquals(200, response.getStatusCode().value());
        assertSame(lista, response.getBody());
        verify(service).findAll(USUARIO_ID, 1, 20);
    }

    @Test
    void buscaPorIdRetorna200ComRegistroDoUsuarioAutenticado() {
        RegistroDiarioResponseDTO dto = resposta(103L);
        when(service.findById(USUARIO_ID, 103L)).thenReturn(dto);

        var response = controller.findById(usuario, 103L);

        assertEquals(200, response.getStatusCode().value());
        assertSame(dto, response.getBody());
        verify(service).findById(USUARIO_ID, 103L);
    }

    @Test
    void atualizacaoRetorna200EUsaUsuarioAutenticado() {
        var request = new RegistroDiarioRequestDTO(1L, null, null, new BigDecimal("90"), 8, 4, 1500, null, null, null);
        RegistroDiarioResponseDTO dto = resposta(104L);
        when(service.update(USUARIO_ID, 104L, request)).thenReturn(dto);

        var response = controller.update(usuario, 104L, request);

        assertEquals(200, response.getStatusCode().value());
        assertSame(dto, response.getBody());
        verify(service).update(USUARIO_ID, 104L, request);
    }

    @Test
    void exclusaoRetorna204EUsaUsuarioAutenticado() {
        var response = controller.delete(usuario, 105L);

        assertEquals(204, response.getStatusCode().value());
        assertNull(response.getBody());
        verify(service).delete(USUARIO_ID, 105L);
    }

    private RegistroDiarioResponseDTO resposta(Long id) {
        return new RegistroDiarioResponseDTO(id, 1L, null, null, null, "Supino reto",
                new BigDecimal("80"), 8, 3, 1200, null, OffsetDateTime.now());
    }
}
