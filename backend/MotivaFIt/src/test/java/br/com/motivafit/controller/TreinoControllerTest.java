package br.com.motivafit.controller;

import br.com.motivafit.dto.request.TreinoRequestDTO;
import br.com.motivafit.dto.response.TreinoResponseDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.TipoTreino;
import br.com.motivafit.enums.Visibilidade;
import br.com.motivafit.service.TreinoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TreinoControllerTest {
    private static final Long USUARIO_ID = 7L;
    private static final Long TREINO_ID = 10L;

    private TreinoService service;
    private TreinoController controller;
    private Usuario usuario;

    @BeforeEach
    void setup() {
        service = mock(TreinoService.class);
        controller = new TreinoController(service);
        usuario = mock(Usuario.class);
        when(usuario.getId()).thenReturn(USUARIO_ID);
    }

    @Test
    void cadastroRetorna201ComOTreinoDoUsuarioAutenticado() {
        var request = new TreinoRequestDTO("Treino A", TipoTreino.MUSCULACAO, null);
        TreinoResponseDTO dto = resposta(TREINO_ID, "Treino A");
        when(service.create(USUARIO_ID, request)).thenReturn(dto);

        var response = controller.create(usuario, request);

        assertEquals(201, response.getStatusCode().value());
        assertSame(dto, response.getBody());
        verify(service).create(USUARIO_ID, request);
    }

    @Test
    void listagemRetorna200ComOsTreinosDoUsuario() {
        List<TreinoResponseDTO> lista = List.of(resposta(1L, "A"), resposta(2L, "B"));
        when(service.findAll(USUARIO_ID)).thenReturn(lista);

        var response = controller.findAll(usuario);

        assertEquals(200, response.getStatusCode().value());
        assertSame(lista, response.getBody());
    }

    @Test
    void buscaPorIdRetorna200() {
        TreinoResponseDTO dto = resposta(TREINO_ID, "Treino A");
        when(service.findById(USUARIO_ID, TREINO_ID)).thenReturn(dto);

        var response = controller.findById(usuario, TREINO_ID);

        assertEquals(200, response.getStatusCode().value());
        assertSame(dto, response.getBody());
    }

    @Test
    void alteracaoRetorna200ComOTreinoAlterado() {
        var request = new TreinoRequestDTO("Novo", TipoTreino.AEROBICO, Visibilidade.PUBLICO);
        TreinoResponseDTO dto = resposta(TREINO_ID, "Novo");
        when(service.update(USUARIO_ID, TREINO_ID, request)).thenReturn(dto);

        var response = controller.update(usuario, TREINO_ID, request);

        assertEquals(200, response.getStatusCode().value());
        assertSame(dto, response.getBody());
    }

    @Test
    void exclusaoRetorna204SemCorpo() {
        var response = controller.delete(usuario, TREINO_ID);

        assertEquals(204, response.getStatusCode().value());
        assertNull(response.getBody());
        verify(service).delete(USUARIO_ID, TREINO_ID);
    }

    private TreinoResponseDTO resposta(Long id, String nome) {
        return new TreinoResponseDTO(id, nome, TipoTreino.MUSCULACAO, Visibilidade.PRIVADO,
                OffsetDateTime.now(), OffsetDateTime.now());
    }
}