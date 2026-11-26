package br.com.motivafit.security;

import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.Perfil;
import br.com.motivafit.exception.NaoAutorizadoException;
import br.com.motivafit.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CustomUserDetailsServiceTest {
    @Test
    void carregaUsuarioPeloEmail() {
        UsuarioRepository repository = mock(UsuarioRepository.class);
        Usuario usuario = new Usuario();
        usuario.setEmail("user@test.com");
        when(repository.findByEmail("user@test.com")).thenReturn(Optional.of(usuario));

        var service = new CustomUserDetailsService(repository);

        assertSame(usuario, service.loadUserByUsername("user@test.com"));
    }

    @Test
    void usuarioAusenteGeraErroPersonalizado() {
        UsuarioRepository repository = mock(UsuarioRepository.class);
        when(repository.findByEmail("missing@test.com")).thenReturn(Optional.empty());
        var service = new CustomUserDetailsService(repository);

        var error = assertThrows(NaoAutorizadoException.class,
                () -> service.loadUserByUsername("missing@test.com"));
        assertEquals("USUARIO_NAO_ENCONTRADO", error.getCodigo());
    }
}
