package br.com.motivafit.controller;

import br.com.motivafit.dto.request.PreferenciasRequestDTO;
import br.com.motivafit.dto.response.PreferenciasResponseDTO;
import br.com.motivafit.dto.response.UsuarioResumoDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.service.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class UsuarioControllerTest {
    private UsuarioService service;
    private UsuarioController controller;
    private Usuario usuario;

    @BeforeEach
    void setUp() {
        service = mock(UsuarioService.class);
        controller = new UsuarioController(service);
        usuario = new Usuario();
        usuario.setId(4L);
    }

    @Test
    void preferenciasUsamAContaAutenticada() {
        when(service.buscarPreferencias(4L)).thenReturn(new PreferenciasResponseDTO("system"));
        when(service.salvarPreferencias(4L, new PreferenciasRequestDTO("light"))).thenReturn(new PreferenciasResponseDTO("light"));

        assertEquals("system", controller.buscarPreferencias(usuario).getBody().tema());
        assertEquals("light", controller.salvarPreferencias(usuario, new PreferenciasRequestDTO("light")).getBody().tema());
    }

    @Test
    void buscaPorEmailRetorna200() {
        when(service.buscarPorEmail(4L, "a@test.com")).thenReturn(new UsuarioResumoDTO(8L, "a@test.com"));

        var resposta = controller.buscarPorEmail(usuario, "a@test.com");

        assertEquals(200, resposta.getStatusCode().value());
        assertEquals(8L, resposta.getBody().id());
    }
}
