package br.com.motivafit.service;

import br.com.motivafit.dto.request.UsuarioRequestDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.Perfil;
import br.com.motivafit.exception.ConflitoException;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.repository.UsuarioRepository;
import br.com.motivafit.repository.RefreshTokenRepository;
import br.com.motivafit.dto.mapper.UsuarioMapper;
import br.com.motivafit.dto.response.UsuarioResponseDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

class UsuarioServiceTest {
    private UsuarioRepository repository;
    private RefreshTokenRepository refreshTokenRepository;
    private UsuarioService service;

    @BeforeEach
    void setup() {
        repository = mock(UsuarioRepository.class);
        refreshTokenRepository = mock(RefreshTokenRepository.class);
        UsuarioMapper mapper = new UsuarioMapper(mock(PasswordEncoder.class));
        service = new UsuarioService(repository, mapper, refreshTokenRepository);
    }

    @Test
    void criaUsuarioEMapeiaResposta() {
        when(repository.existsByEmail("novo@test.com")).thenReturn(false);
        when(repository.save(any(Usuario.class))).thenAnswer(invocation -> {
            Usuario saved = invocation.getArgument(0);
            saved.setEmail("novo@test.com");
            return saved;
        });

        var response = service.create(new UsuarioRequestDTO("novo@test.com", "senha"));

        assertEquals("novo@test.com", response.email());
        assertEquals(Perfil.USUARIO, response.perfil());
        assertTrue(response.ativo());
        verify(repository).save(any(Usuario.class));
    }

    @Test
    void emailDuplicadoGeraConflitoSemSalvar() {
        when(repository.existsByEmail("existente@test.com")).thenReturn(true);

        assertThrows(ConflitoException.class,
                () -> service.create(new UsuarioRequestDTO("existente@test.com", "senha")));
        verify(repository, never()).save(any());
    }

    @Test
    void findAllRetornaTodosOsUsuariosMapeados() {
        var primeiro = usuario("primeiro@test.com");
        var segundo = usuario("segundo@test.com");
        when(repository.findAll()).thenReturn(List.of(primeiro, segundo));

        List<UsuarioResponseDTO> response = service.findAll();

        assertEquals(2, response.size());
        assertEquals("primeiro@test.com", response.get(0).email());
        assertEquals("segundo@test.com", response.get(1).email());
        verify(repository).findAll();
    }

    @Test
    void findByIdRetornaUsuarioEncontrado() {
        var usuario = usuario("encontrado@test.com");
        when(repository.findById(7L)).thenReturn(Optional.of(usuario));

        var response = service.findById(7L);

        assertEquals("encontrado@test.com", response.email());
        verify(repository).findById(7L);
    }

    @Test
    void findByIdLancaNaoEncontradoQuandoUsuarioNaoExiste() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        var exception = assertThrows(NaoEncontradoException.class, () -> service.findById(99L));

        assertEquals("USUARIO_NAO_ENCONTRADO", exception.getCodigo());
        verify(repository).findById(99L);
    }

    @Test
    void deleteRemoveUsuarioEncontrado() {
        var usuario = usuario("remover@test.com");
        when(repository.findById(3L)).thenReturn(Optional.of(usuario));

        service.delete(3L);

        verify(refreshTokenRepository).deleteByUsuarioId(usuario);
        verify(repository).delete(usuario);
    }

    @Test
    void deleteNaoRemoveQuandoUsuarioNaoExiste() {
        when(repository.findById(4L)).thenReturn(Optional.empty());

        assertThrows(NaoEncontradoException.class, () -> service.delete(4L));

        verify(repository, never()).delete(any());
    }

    private Usuario usuario(String email) {
        var usuario = new Usuario();
        usuario.setEmail(email);
        usuario.setPerfil(Perfil.USUARIO);
        usuario.setAtivo(true);
        return usuario;
    }

    @Test
    void salvaEConsultaTemaDaConta() {
        Usuario usuario = new Usuario();
        usuario.setId(3L);
        when(repository.findById(3L)).thenReturn(java.util.Optional.of(usuario));
        when(repository.save(usuario)).thenReturn(usuario);

        assertEquals("system", service.buscarPreferencias(3L).tema());
        assertEquals("dark", service.salvarPreferencias(3L, new br.com.motivafit.dto.request.PreferenciasRequestDTO("dark")).tema());
        assertEquals("dark", usuario.getTema());
    }

    @Test
    void buscaPorEmailIgnoraContaInativaEPropria() {
        Usuario ativo = new Usuario();
        ativo.setId(8L);
        ativo.setEmail("amigo@test.com");
        ativo.setAtivo(true);
        Usuario inativo = new Usuario();
        inativo.setId(9L);
        inativo.setAtivo(false);
        when(repository.findByEmailIgnoreCase("amigo@test.com")).thenReturn(java.util.Optional.of(ativo));
        when(repository.findByEmailIgnoreCase("inativo@test.com")).thenReturn(java.util.Optional.of(inativo));

        assertEquals(8L, service.buscarPorEmail(1L, " Amigo@Test.com ").id());
        assertThrows(br.com.motivafit.exception.NaoEncontradoException.class, () -> service.buscarPorEmail(8L, "amigo@test.com"));
        assertThrows(br.com.motivafit.exception.NaoEncontradoException.class, () -> service.buscarPorEmail(1L, "inativo@test.com"));
        assertThrows(br.com.motivafit.exception.RequisicaoInvalidaException.class, () -> service.buscarPorEmail(1L, "  "));
    }
}
