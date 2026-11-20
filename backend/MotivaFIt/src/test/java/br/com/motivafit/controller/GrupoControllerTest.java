package br.com.motivafit.controller;

import br.com.motivafit.dto.request.GrupoRequestDTO;
import br.com.motivafit.dto.response.GrupoResponseDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.PapelGrupo;
import br.com.motivafit.service.GrupoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class GrupoControllerTest {
    private GrupoService service;
    private GrupoController controller;

    @BeforeEach
    void setUp() {
        service = mock(GrupoService.class);
        controller = new GrupoController(service);
    }

    @Test
    void criarGrupoRetorna201() {
        Usuario usuario = new Usuario();
        usuario.setId(5L);
        var dto = new GrupoResponseDTO(10L, "Corrida", "Treinos", 5L,
                PapelGrupo.ADMIN, OffsetDateTime.now(), null);
        when(service.create(5L, new GrupoRequestDTO("Corrida", "Treinos"))).thenReturn(dto);

        var resposta = controller.create(usuario, new GrupoRequestDTO("Corrida", "Treinos"));

        assertEquals(201, resposta.getStatusCode().value());
        assertEquals(dto, resposta.getBody());
    }

    @Test
    void removerMembroRetorna204() {
        Usuario usuario = new Usuario();
        usuario.setId(5L);

        var resposta = controller.removerMembro(usuario, 10L, 15L);

        assertEquals(204, resposta.getStatusCode().value());
        verify(service).removerMembro(5L, 10L, 15L);
    }
}
