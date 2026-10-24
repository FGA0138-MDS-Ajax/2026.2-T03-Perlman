package br.com.motivafit.controller;

import br.com.motivafit.dto.request.CatalogoExercicioRequestDTO;
import br.com.motivafit.dto.response.CatalogoExercicioResponseDTO;
import br.com.motivafit.enums.Modalidade;
import br.com.motivafit.service.CatalogoExercicioAdminService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CatalogoExercicioAdminControllerTest {
    private CatalogoExercicioAdminService service;
    private CatalogoExercicioAdminController controller;

    @BeforeEach
    void setup() {
        service = mock(CatalogoExercicioAdminService.class);
        controller = new CatalogoExercicioAdminController(service);
    }

    @Test
    void cadastroRetorna201ComOExercicioCriado() {
        var request = new CatalogoExercicioRequestDTO("Remada cavalinho", Modalidade.MUSCULACAO, "Costas");
        var dto = new CatalogoExercicioResponseDTO(30L, "Remada cavalinho", Modalidade.MUSCULACAO, "Costas");
        when(service.create(request)).thenReturn(dto);

        var response = controller.create(request);

        assertEquals(201, response.getStatusCode().value());
        assertSame(dto, response.getBody());
    }

    @Test
    void alteracaoRetorna200ComOExercicioAlterado() {
        var request = new CatalogoExercicioRequestDTO("Stiff", Modalidade.MUSCULACAO, "Posterior de coxa");
        var dto = new CatalogoExercicioResponseDTO(5L, "Stiff", Modalidade.MUSCULACAO, "Posterior de coxa");
        when(service.update(5L, request)).thenReturn(dto);

        var response = controller.update(5L, request);

        assertEquals(200, response.getStatusCode().value());
        assertSame(dto, response.getBody());
    }

    @Test
    void desativacaoRetorna204SemCorpo() {
        var response = controller.deactivate(5L);

        assertEquals(204, response.getStatusCode().value());
        assertNull(response.getBody());
        verify(service).deactivate(5L);
    }

    @Test
    void controllerExigePerfilAdministradorOuSuperusuario() {
        PreAuthorize anotacao = CatalogoExercicioAdminController.class.getAnnotation(PreAuthorize.class);

        assertNotNull(anotacao);
        assertEquals("hasAnyRole('ADMINISTRADOR', 'SUPERUSUARIO')", anotacao.value());
    }
}