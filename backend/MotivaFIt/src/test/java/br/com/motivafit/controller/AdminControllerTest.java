package br.com.motivafit.controller;

import br.com.motivafit.dto.request.AceitarConviteRequestDTO;
import br.com.motivafit.dto.request.ConviteAdminRequestDTO;
import br.com.motivafit.dto.response.ConviteCriado;
import br.com.motivafit.service.AdminService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdminControllerTest {
    private AdminService service;
    private AdminController controller;

    @BeforeEach
    void setUp() {
        service = mock(AdminService.class);
        controller = new AdminController(service);
    }

    @Test
    void criarConviteRetorna201ComConviteCriado() {
        var request = new ConviteAdminRequestDTO(1L, "convidado@exemplo.com");
        var convite = new ConviteCriado(10L, "convidado@exemplo.com", "token", Instant.now().plusSeconds(600));
        when(service.criarConvite(request)).thenReturn(convite);

        var response = controller.criarConvite(request);

        assertEquals(201, response.getStatusCode().value());
        assertSame(convite, response.getBody());
    }

    @Test
    void criarConviteExigePerfilSuperusuario() throws Exception {
        var method = AdminController.class.getMethod("criarConvite", ConviteAdminRequestDTO.class);
        var annotation = method.getAnnotation(PreAuthorize.class);

        assertNotNull(annotation);
        assertEquals("hasRole('SUPERUSUARIO')", annotation.value());
    }

    @Test
    void aceitarConviteRetorna204ESemConteudo() {
        var request = new AceitarConviteRequestDTO(2L, "token");

        var response = controller.aceitarConvite(request);

        assertEquals(204, response.getStatusCode().value());
        assertNull(response.getBody());
        verify(service).aceitarConvite(request);
    }
}
