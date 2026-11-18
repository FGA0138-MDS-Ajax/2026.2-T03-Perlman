package br.com.motivafit.service;

import br.com.motivafit.dto.request.GoogleLoginRequestDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.Perfil;
import br.com.motivafit.exception.NaoAutorizadoException;
import br.com.motivafit.repository.UsuarioRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Date;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class GoogleAuthServiceTest {

    private UsuarioRepository repository;
    private PasswordEncoder encoder;
    private LoginService loginService;
    private GoogleAuthService service;

    @BeforeEach
    void setup() {
        repository = mock(UsuarioRepository.class);
        encoder = mock(PasswordEncoder.class);
        loginService = mock(LoginService.class);
        service = new GoogleAuthService(repository, encoder, loginService, "test-client-id");
    }

    @Test
    void loginCriaUsuarioENaoExiste() {
        GoogleIdToken.Payload payload = mock(GoogleIdToken.Payload.class);
        when(payload.getEmail()).thenReturn("novo@gmail.com");
        when(payload.getEmailVerified()).thenReturn(true);
        when(service.validarGoogleIdToken(anyString())).thenReturn(payload);

        Usuario novo = new Usuario();
        novo.setId(2L);
        novo.setEmail("novo@gmail.com");
        novo.setAtivo(true);
        novo.setPerfil(Perfil.USUARIO);
        when(repository.findByEmail("novo@gmail.com")).thenReturn(Optional.empty());
        when(repository.save(any(Usuario.class))).thenReturn(novo);
        when(encoder.encode(anyString())).thenReturn("$2a$encoded");

        LoginService.LoginResult expected = new LoginService.LoginResult(
                new br.com.motivafit.dto.response.LoginResponseDTO("access", new Date()), "refresh");
        when(loginService.loginComUsuario(novo)).thenReturn(expected);

        var result = service.login(new GoogleLoginRequestDTO("token"));

        assertEquals("access", result.response().token());
        verify(repository).save(any(Usuario.class));
        verify(loginService).loginComUsuario(novo);
    }

    @Test
    void loginRetornaExistente() {
        GoogleIdToken.Payload payload = mock(GoogleIdToken.Payload.class);
        when(payload.getEmail()).thenReturn("existente@gmail.com");
        when(service.validarGoogleIdToken(anyString())).thenReturn(payload);

        Usuario existente = new Usuario();
        existente.setId(1L);
        existente.setEmail("existente@gmail.com");
        existente.setAtivo(true);
        existente.setPerfil(Perfil.USUARIO);
        when(repository.findByEmail("existente@gmail.com")).thenReturn(Optional.of(existente));

        LoginService.LoginResult expected = new LoginService.LoginResult(
                new br.com.motivafit.dto.response.LoginResponseDTO("access", new Date()), "refresh");
        when(loginService.loginComUsuario(existente)).thenReturn(expected);

        var result = service.login(new GoogleLoginRequestDTO("token"));

        assertEquals("access", result.response().token());
        verify(repository, never()).save(any());
        verify(loginService).loginComUsuario(existente);
    }

    @Test
    void loginRejeitaContaInativa() {
        GoogleIdToken.Payload payload = mock(GoogleIdToken.Payload.class);
        when(payload.getEmail()).thenReturn("inativo@gmail.com");
        when(service.validarGoogleIdToken(anyString())).thenReturn(payload);

        Usuario inativo = new Usuario();
        inativo.setId(1L);
        inativo.setEmail("inativo@gmail.com");
        inativo.setAtivo(false);
        when(repository.findByEmail("inativo@gmail.com")).thenReturn(Optional.of(inativo));

        assertThrows(NaoAutorizadoException.class, () -> service.login(new GoogleLoginRequestDTO("token")));
    }

    @Test
    void loginRejeitaEmailNulo() {
        GoogleIdToken.Payload payload = mock(GoogleIdToken.Payload.class);
        when(payload.getEmail()).thenReturn(null);
        when(service.validarGoogleIdToken(anyString())).thenReturn(payload);

        assertThrows(NaoAutorizadoException.class, () -> service.login(new GoogleLoginRequestDTO("token")));
    }

    @Test
    void validarGoogleIdTokenRejeitaTokenInvalido() {
        assertThrows(NaoAutorizadoException.class, () -> service.validarGoogleIdToken("token-invalido"));
    }
}
