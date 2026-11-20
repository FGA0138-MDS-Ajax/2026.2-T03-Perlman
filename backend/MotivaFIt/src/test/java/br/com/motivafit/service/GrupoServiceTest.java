package br.com.motivafit.service;

import br.com.motivafit.dto.request.GrupoRequestDTO;
import br.com.motivafit.entity.Grupo;
import br.com.motivafit.entity.GrupoMembro;
import br.com.motivafit.enums.PapelGrupo;
import br.com.motivafit.exception.AcessoNegadoException;
import br.com.motivafit.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GrupoServiceTest {
    private GrupoRepository grupoRepository;
    private GrupoMembroRepository membroRepository;
    private ConviteGrupoRepository conviteRepository;
    private GrupoFeedPostRepository feedRepository;
    private UsuarioRepository usuarioRepository;
    private GrupoService service;

    @BeforeEach
    void setUp() {
        grupoRepository = mock(GrupoRepository.class);
        membroRepository = mock(GrupoMembroRepository.class);
        conviteRepository = mock(ConviteGrupoRepository.class);
        feedRepository = mock(GrupoFeedPostRepository.class);
        usuarioRepository = mock(UsuarioRepository.class);
        service = new GrupoService(grupoRepository, membroRepository, conviteRepository, feedRepository, usuarioRepository);
    }

    @Test
    void criarGrupoRetornaAdministradorECriaMembro() {
        when(grupoRepository.save(any(Grupo.class))).thenAnswer(invocation -> {
            Grupo grupo = invocation.getArgument(0);
            grupo.setId(10L);
            return grupo;
        });

        var resposta = service.create(5L, new GrupoRequestDTO("Corrida", "Treinos"));

        assertEquals(10L, resposta.id());
        assertEquals("Corrida", resposta.nome());
        assertEquals(PapelGrupo.ADMIN, resposta.papel());
        verify(membroRepository).save(argThat(membro ->
                membro.getGrupoId().equals(10L)
                        && membro.getUsuarioId().equals(5L)
                        && membro.getPapel() == PapelGrupo.ADMIN));
    }

    @Test
    void usuarioNaoMembroNaoConsultaGrupo() {
        Grupo grupo = new Grupo();
        grupo.setId(10L);
        when(grupoRepository.findById(10L)).thenReturn(Optional.of(grupo));
        when(membroRepository.findByGrupoIdAndUsuarioId(10L, 5L)).thenReturn(Optional.empty());

        assertThrows(AcessoNegadoException.class, () -> service.findById(5L, 10L));
    }

    @Test
    void removerUltimoAdministradorExigeOutroAdministrador() {
        Grupo grupo = new Grupo();
        grupo.setId(10L);
        GrupoMembro autor = new GrupoMembro();
        autor.setPapel(PapelGrupo.ADMIN);
        GrupoMembro alvo = new GrupoMembro();
        alvo.setPapel(PapelGrupo.ADMIN);

        when(grupoRepository.findById(10L)).thenReturn(Optional.of(grupo));
        when(membroRepository.findByGrupoIdAndUsuarioId(10L, 5L)).thenReturn(Optional.of(autor));
        when(membroRepository.findByGrupoIdAndUsuarioId(10L, 5L)).thenReturn(Optional.of(alvo));
        when(membroRepository.countByGrupoIdAndPapel(10L, PapelGrupo.ADMIN)).thenReturn(1L);

        assertThrows(br.com.motivafit.exception.ConflitoException.class,
                () -> service.removerMembro(5L, 10L, 5L));
    }
}
