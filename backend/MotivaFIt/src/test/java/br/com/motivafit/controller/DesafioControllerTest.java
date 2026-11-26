package br.com.motivafit.controller;

import br.com.motivafit.dto.request.AdicionarParticipanteRequestDTO;
import br.com.motivafit.dto.request.DesafioItemRequestDTO;
import br.com.motivafit.dto.request.DesafioRequestDTO;
import br.com.motivafit.dto.request.ParticipanteUpdateRequestDTO;
import br.com.motivafit.dto.response.DesafioParticipanteResponseDTO;
import br.com.motivafit.dto.response.DesafioResponseDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.EstadoDesafio;
import br.com.motivafit.enums.EstadoParticipante;
import br.com.motivafit.service.DesafioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.OffsetDateTime;
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
    void listagemRetorna200ComOsDesafiosVisiveis() {
        List<DesafioResponseDTO> lista = List.of(resposta());
        when(service.findAll(USUARIO_ID)).thenReturn(lista);

        var response = controller.findAll(usuario);

        assertEquals(200, response.getStatusCode().value());
        assertSame(lista, response.getBody());
    }

    @Test
    void obterPorIdRetorna200ComODesafio() {
        DesafioResponseDTO dto = resposta();
        when(service.findById(USUARIO_ID, DESAFIO_ID)).thenReturn(dto);

        var response = controller.findById(usuario, DESAFIO_ID);

        assertEquals(200, response.getStatusCode().value());
        assertSame(dto, response.getBody());
        verify(service).findById(USUARIO_ID, DESAFIO_ID);
    }

    @Test
    void atualizacaoRetorna200ComODesafioAtualizado() {
        var request = new DesafioRequestDTO("Desafio atualizado", LocalDate.of(2026, 12, 20),
                List.of(new DesafioItemRequestDTO(1L, null, 100, null, null, null)));
        DesafioResponseDTO dto = resposta();
        when(service.update(USUARIO_ID, DESAFIO_ID, request)).thenReturn(dto);

        var response = controller.update(usuario, DESAFIO_ID, request);

        assertEquals(200, response.getStatusCode().value());
        assertSame(dto, response.getBody());
        verify(service).update(USUARIO_ID, DESAFIO_ID, request);
    }

    @Test
    void remocaoRetorna204SemCorpo() {
        var response = controller.delete(usuario, DESAFIO_ID);

        assertEquals(204, response.getStatusCode().value());
        assertNull(response.getBody());
        verify(service).delete(USUARIO_ID, DESAFIO_ID);
    }

    // --- Participantes ---

    @Test
    void listarParticipantesRetorna200() {
        List<DesafioParticipanteResponseDTO> lista = List.of(participanteResponse());
        when(service.findParticipantes(USUARIO_ID, DESAFIO_ID)).thenReturn(lista);

        var response = controller.findParticipantes(usuario, DESAFIO_ID);

        assertEquals(200, response.getStatusCode().value());
        assertSame(lista, response.getBody());
        verify(service).findParticipantes(USUARIO_ID, DESAFIO_ID);
    }

    @Test
    void adicionarParticipanteRetorna201() {
        var request = new AdicionarParticipanteRequestDTO(99L);
        DesafioParticipanteResponseDTO dto = participanteResponse();
        when(service.addParticipante(USUARIO_ID, DESAFIO_ID, request)).thenReturn(dto);

        var response = controller.addParticipante(usuario, DESAFIO_ID, request);

        assertEquals(201, response.getStatusCode().value());
        assertSame(dto, response.getBody());
        verify(service).addParticipante(USUARIO_ID, DESAFIO_ID, request);
    }

    @Test
    void atualizarMinhaParticipacaoRetorna200() {
        var request = new ParticipanteUpdateRequestDTO(EstadoParticipante.ACEITO);
        DesafioParticipanteResponseDTO dto = participanteResponse();
        when(service.updateMinhaParticipacao(USUARIO_ID, DESAFIO_ID, request)).thenReturn(dto);

        var response = controller.updateMinhaParticipacao(usuario, DESAFIO_ID, request);

        assertEquals(200, response.getStatusCode().value());
        assertSame(dto, response.getBody());
        verify(service).updateMinhaParticipacao(USUARIO_ID, DESAFIO_ID, request);
    }

    @Test
    void sairDoDesafioRetorna204() {
        var response = controller.deleteMinhaParticipacao(usuario, DESAFIO_ID);

        assertEquals(204, response.getStatusCode().value());
        assertNull(response.getBody());
        verify(service).deleteMinhaParticipacao(USUARIO_ID, DESAFIO_ID);
    }

    private DesafioResponseDTO resposta() {
        return new DesafioResponseDTO(DESAFIO_ID, "Desafio", LocalDate.of(2026, 12, 15),
                EstadoDesafio.ATIVO, true, List.of());
    }

    private DesafioParticipanteResponseDTO participanteResponse() {
        return new DesafioParticipanteResponseDTO(99L, "amigo@motivafit.com",
                EstadoParticipante.CONVIDADO, OffsetDateTime.now());
    }
}
