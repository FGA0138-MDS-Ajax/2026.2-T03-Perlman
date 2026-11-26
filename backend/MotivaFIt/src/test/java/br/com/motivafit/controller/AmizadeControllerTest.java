package br.com.motivafit.controller;

import br.com.motivafit.dto.request.AmizadeRequestDTO;
import br.com.motivafit.dto.request.AmizadeUpdateRequestDTO;
import br.com.motivafit.dto.response.AmizadeResponseDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.EstadoAmizade;
import br.com.motivafit.service.AmizadeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AmizadeControllerTest {
    private static final Long USUARIO_ID = 7L;
    private static final Long AMIZADE_ID = 1L;

    private AmizadeService service;
    private AmizadeController controller;
    private Usuario usuario;

    @BeforeEach
    void setup() {
        service = mock(AmizadeService.class);
        controller = new AmizadeController(service);
        usuario = mock(Usuario.class);
        when(usuario.getId()).thenReturn(USUARIO_ID);
    }

    @Test
    void listagemRetorna200ComAsAmizadesDoUsuario() {
        List<AmizadeResponseDTO> lista = List.of(resposta());
        when(service.findAll(USUARIO_ID)).thenReturn(lista);

        var response = controller.findAll(usuario);

        assertEquals(200, response.getStatusCode().value());
        assertSame(lista, response.getBody());
    }

    @Test
    void envioDeSolicitacaoRetorna201() {
        var request = new AmizadeRequestDTO(15L);
        AmizadeResponseDTO dto = resposta();
        when(service.create(USUARIO_ID, request)).thenReturn(dto);

        var response = controller.create(usuario, request);

        assertEquals(201, response.getStatusCode().value());
        assertSame(dto, response.getBody());
        verify(service).create(USUARIO_ID, request);
    }

    @Test
    void atualizacaoRetorna200ComAmizadeAtualizada() {
        var request = new AmizadeUpdateRequestDTO(EstadoAmizade.ACEITA);
        AmizadeResponseDTO dto = resposta();
        when(service.update(USUARIO_ID, AMIZADE_ID, request)).thenReturn(dto);

        var response = controller.update(usuario, AMIZADE_ID, request);

        assertEquals(200, response.getStatusCode().value());
        assertSame(dto, response.getBody());
        verify(service).update(USUARIO_ID, AMIZADE_ID, request);
    }

    @Test
    void remocaoRetorna204SemCorpo() {
        var response = controller.delete(usuario, AMIZADE_ID);

        assertEquals(204, response.getStatusCode().value());
        assertNull(response.getBody());
        verify(service).delete(USUARIO_ID, AMIZADE_ID);
    }

    private AmizadeResponseDTO resposta() {
        return new AmizadeResponseDTO(
                AMIZADE_ID, USUARIO_ID, "solicitante@teste.com",
                15L, "destinatario@teste.com",
                EstadoAmizade.PENDENTE, OffsetDateTime.now(), null);
    }
}
