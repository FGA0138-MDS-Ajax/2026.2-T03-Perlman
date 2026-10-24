package br.com.motivafit.security;

import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.Perfil;
import br.com.motivafit.exception.RequisicaoInvalidaException;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {
    private static final String SECRET = Base64.getEncoder().encodeToString(new byte[32]);

    @Test
    void geraAccessTokenValidoComEmailEExpiracao() {
        JwtService service = new JwtService(SECRET, "motivafit", 15, 7);
        Usuario usuario = usuario();

        String token = service.gerarToken(usuario);

        assertTrue(service.isTokenValid(token));
        assertEquals(usuario.getEmail(), service.extractEmail(token));
        assertTrue(service.extractExpiration(token).toInstant().isAfter(Instant.now()));
    }

    @Test
    void tokenMalformadoEInvalido() {
        JwtService service = new JwtService(SECRET, "motivafit", 15, 7);
        assertFalse(service.isTokenValid("token-invalido"));
    }

    @Test
    void refreshOpacoUnicoHashDeterministicoEExpiraEmSeteDias() {
        JwtService service = new JwtService(SECRET, "motivafit", 15, 7);
        String token1 = service.gerarRefreshToken();
        String token2 = service.gerarRefreshToken();

        assertNotEquals(token1, token2);
        assertEquals(43, token1.length());
        assertEquals(service.hashRefreshToken(token1), service.hashRefreshToken(token1));
        assertNotEquals(service.hashRefreshToken(token1), service.hashRefreshToken(token2));
        assertTrue(service.refreshExpiration().after(new java.util.Date()));
    }

    @Test
    void rejeitaConfiguracaoJwtInvalida() {
        assertThrows(RequisicaoInvalidaException.class, () -> new JwtService("curta", "issuer", 15, 7));
        assertThrows(RequisicaoInvalidaException.class, () -> new JwtService(SECRET, "issuer", 0, 7));
        assertThrows(RequisicaoInvalidaException.class, () -> new JwtService(SECRET, "issuer", 15, 0));
    }

    private Usuario usuario() {
        Usuario usuario = new Usuario();
        usuario.setEmail("teste@motivafit.com");
        usuario.setAtivo(true);
        usuario.setPerfil(Perfil.USUARIO);
        return usuario;
    }
}
