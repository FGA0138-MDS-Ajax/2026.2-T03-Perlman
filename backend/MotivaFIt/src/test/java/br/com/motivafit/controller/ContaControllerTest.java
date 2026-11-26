package br.com.motivafit.controller;

import br.com.motivafit.dto.response.UsuarioResponseDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.Perfil;
import br.com.motivafit.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ContaControllerTest {
    private UsuarioService service;
    private ContaController controller;

    @BeforeEach
    void setUp() {
        service = mock(UsuarioService.class);
        controller = new ContaController(service);
    }

    @Test
    void findByIdRetorna200EEncaminhaUsuarioAutenticado() {
        var usuario = new Usuario();
        var conta = new UsuarioResponseDTO(1L, "usuario@motivafit.com", Perfil.USUARIO, true);
        when(service.findById(1L)).thenReturn(conta);

        var response = controller.findById(1L);

        assertEquals(200, response.getStatusCode().value());
        assertSame(conta, response.getBody());
        verify(service).findById(1L);
    }

    @Test
    void deleteRetorna204EEncaminhaUsuarioAutenticado() {
        var response = controller.delete(1L);

        assertEquals(204, response.getStatusCode().value());
        assertNull(response.getBody());
        verify(service).delete(1L);
    }

    @Test
    void controllerPossuiDocumentacaoOpenApiDosEndpoints() throws Exception {
        assertEquals("Conta", ContaController.class.getAnnotation(Tag.class).name());
        // A exportação de todas as contas foi removida: nenhuma rota lista contas de outras pessoas.
        assertThrows(NoSuchMethodException.class, () -> ContaController.class.getMethod("findAll"));
        for (var method : List.of(
                ContaController.class.getMethod("findById", Long.class),
                ContaController.class.getMethod("delete", Long.class))) {
            assertNotNull(method.getAnnotation(Operation.class));
            assertNotNull(method.getAnnotation(ApiResponses.class));
            assertEquals("AccessToken", method.getAnnotation(SecurityRequirement.class).name());
        }
    }
}
