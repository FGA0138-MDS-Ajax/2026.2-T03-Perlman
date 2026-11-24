package br.com.motivafit.service;

import br.com.motivafit.entity.Treino;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.TipoTreino;
import br.com.motivafit.enums.Visibilidade;
import br.com.motivafit.exception.RequisicaoInvalidaException;
import br.com.motivafit.repository.TreinoRepository;
import br.com.motivafit.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AdminTreinoServiceTest {
    private TreinoRepository treinoRepository;
    private UsuarioRepository usuarioRepository;
    private AdminTreinoService service;

    @BeforeEach
    void setUp() {
        treinoRepository = mock(TreinoRepository.class);
        usuarioRepository = mock(UsuarioRepository.class);
        service = new AdminTreinoService(treinoRepository, usuarioRepository);
    }

    @Test
    void listaTreinosComEmailDoDonoETotal() {
        Treino treino = new Treino();
        ReflectionTestUtils.setField(treino, "id", 12L);
        treino.setUsuarioId(42L);
        treino.setNome("Treino A");
        treino.setTipo(TipoTreino.MUSCULACAO);
        treino.setVisibilidade(Visibilidade.PUBLICO);
        Usuario dono = new Usuario();
        dono.setId(42L);
        dono.setEmail("dono@test.com");
        when(treinoRepository.findAllByExcluidoEmIsNull(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(treino), PageRequest.of(1, 1), 3));
        when(usuarioRepository.findAllById(List.of(42L))).thenReturn(List.of(dono));

        var pagina = service.listar(1, 1);

        assertEquals(3, pagina.total());
        assertEquals(1, pagina.pagina());
        assertEquals("dono@test.com", pagina.itens().get(0).usuarioEmail());
        assertEquals(Visibilidade.PUBLICO, pagina.itens().get(0).visibilidade());
    }

    @Test
    void rejeitaPaginaInvalida() {
        assertThrows(RequisicaoInvalidaException.class, () -> service.listar(-1, 10));
        assertThrows(RequisicaoInvalidaException.class, () -> service.listar(0, 0));
        assertThrows(RequisicaoInvalidaException.class, () -> service.listar(0, 101));
        verifyNoInteractions(treinoRepository);
    }
}
