package br.com.motivafit.service;

import br.com.motivafit.dto.request.LoginRequestDTO;
import br.com.motivafit.entity.RefreshToken;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.Perfil;
import br.com.motivafit.exception.NaoAutorizadoException;
import br.com.motivafit.repository.RefreshTokenRepository;
import br.com.motivafit.repository.UsuarioRepository;
import br.com.motivafit.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class LoginServiceTest {
    private UsuarioRepository usuarios;
    private PasswordEncoder encoder;
    private JwtService jwt;
    private RefreshTokenRepository refreshTokens;
    private LoginService service;
    private Usuario usuario;

    @BeforeEach
    void setup() {
        usuarios = mock(UsuarioRepository.class);
        encoder = mock(PasswordEncoder.class);
        jwt = mock(JwtService.class);
        refreshTokens = mock(RefreshTokenRepository.class);
        service = new LoginService(usuarios, encoder, jwt, refreshTokens);
        usuario = new Usuario();
        usuario.setEmail("user@test.com");
        usuario.setSenhaHash("hash");
        usuario.setAtivo(true);
        usuario.setPerfil(Perfil.USUARIO);
        when(jwt.gerarToken(usuario)).thenReturn("access-token");
        when(jwt.extractExpiration("access-token")).thenReturn(new Date(System.currentTimeMillis() + 60_000));
        when(jwt.refreshExpiration()).thenReturn(new Date(System.currentTimeMillis() + 604_800_000));
        when(jwt.hashRefreshToken(any())).thenAnswer(i -> "hash:" + i.getArgument(0));
    }

    @Test
    void loginValidoPersisteHashEDevolveAccessToken() {
        when(usuarios.findByEmail("user@test.com")).thenReturn(Optional.of(usuario));
        when(encoder.matches("senha", "hash")).thenReturn(true);
        when(jwt.gerarRefreshToken()).thenReturn("refresh-plain");

        LoginService.LoginResult result = service.login(new LoginRequestDTO("user@test.com", "senha"));

        assertEquals("access-token", result.response().token());
        assertEquals("refresh-plain", result.refreshToken());
        verify(refreshTokens).save(argThat(token -> token.getHash().equals("hash:refresh-plain")
                && token.getUsuarioId() == usuario && token.getFamilia() != null));
    }

    @Test
    void loginRejeitaEmailInexistenteSenhaErradaOuContaInativa() {
        LoginRequestDTO req = new LoginRequestDTO("user@test.com", "senha");
        when(usuarios.findByEmail("user@test.com")).thenReturn(Optional.empty());
        assertThrows(NaoAutorizadoException.class, () -> service.login(req));

        when(usuarios.findByEmail("user@test.com")).thenReturn(Optional.of(usuario));
        when(encoder.matches("senha", "hash")).thenReturn(false);
        assertThrows(NaoAutorizadoException.class, () -> service.login(req));
        when(encoder.matches("senha", "hash")).thenReturn(true);
        usuario.setAtivo(false);
        assertThrows(NaoAutorizadoException.class, () -> service.login(req));
        verify(refreshTokens, never()).save(any());
    }

    @Test
    void refreshRotacionaTokenMantendoFamilia() {
        RefreshToken atual = token("refresh-plain", "familia", null, usuario, new Date(System.currentTimeMillis() + 60000));
        when(jwt.gerarRefreshToken()).thenReturn("novo-refresh");
        when(refreshTokens.findByHash("hash:refresh-plain")).thenReturn(Optional.of(atual));
        when(refreshTokens.save(any())).thenAnswer(i -> i.getArgument(0));

        LoginService.LoginResult result = service.refresh("refresh-plain");

        assertEquals("novo-refresh", result.refreshToken());
        assertNotNull(atual.getRevogacao());
        verify(refreshTokens).save(argThat(t -> "hash:novo-refresh".equals(t.getHash())
                && "familia".equals(t.getFamilia())));
    }

    @Test
    void refreshReutilizadoOuExpiradoRevogaFamilia() {
        RefreshToken usado = token("antigo", "familia", new Date(), usuario, new Date(System.currentTimeMillis() + 60000));
        RefreshToken membro = token("outro", "familia", null, usuario, new Date(System.currentTimeMillis() + 60000));
        when(refreshTokens.findByHash("hash:replay")).thenReturn(Optional.of(usado));
        when(refreshTokens.findByHash("hash:expired")).thenReturn(Optional.of(
                token("expirado", "familia", null, usuario, new Date(0))));
        when(refreshTokens.findByFamilia("familia")).thenReturn(List.of(usado, membro));

        assertThrows(NaoAutorizadoException.class, () -> service.refresh("replay"));
        assertNotNull(membro.getRevogacao());
        assertThrows(NaoAutorizadoException.class, () -> service.refresh("expired"));
    }

    @Test
    void refreshRejeitaAusenteDesconhecidoEUsuarioInativo() {
        assertThrows(NaoAutorizadoException.class, () -> service.refresh(null));
        when(refreshTokens.findByHash("hash:unknown")).thenReturn(Optional.empty());
        assertThrows(NaoAutorizadoException.class, () -> service.refresh("unknown"));
        usuario.setAtivo(false);
        when(refreshTokens.findByHash("hash:inactive")).thenReturn(Optional.of(
                token("inactive", "familia", null, usuario, new Date(System.currentTimeMillis() + 60000))));
        when(refreshTokens.findByFamilia("familia")).thenReturn(List.of());
        assertThrows(NaoAutorizadoException.class, () -> service.refresh("inactive"));
    }

    @Test
    void logoutRevogaFamiliaSeEncontrarTokenEIgnoraAusente() {
        RefreshToken token = token("raw", "familia", null, usuario, new Date());
        RefreshToken membro = token("membro", "familia", null, usuario, new Date());
        when(refreshTokens.findByHash("hash:raw")).thenReturn(Optional.of(token));
        when(refreshTokens.findByFamilia("familia")).thenReturn(List.of(token, membro));

        service.logout("raw");
        service.logout("");

        assertNotNull(token.getRevogacao());
        assertNotNull(membro.getRevogacao());
        verify(refreshTokens, times(1)).findByHash("hash:raw");
    }

    private RefreshToken token(String hash, String family, Date revoked, Usuario owner, Date expires) {
        RefreshToken token = new RefreshToken();
        token.setHash(hash);
        token.setFamilia(family);
        token.setRevogacao(revoked);
        token.setUsuarioId(owner);
        token.setValidade(expires);
        return token;
    }
}
