package br.com.motivafit.entity;

import br.com.motivafit.enums.Perfil;
import org.junit.jupiter.api.Test;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class EntidadesTest {
    @Test
    void usuarioImplementaUserDetailsEComparacaoPorId() {
        Usuario usuario = new Usuario();
        usuario.setEmail("user@test.com");
        usuario.setSenhaHash("bcrypt");
        usuario.setAtivo(true);
        usuario.setPerfil(Perfil.ADMINISTRADOR);

        assertEquals("user@test.com", usuario.getUsername());
        assertEquals("bcrypt", usuario.getPassword());
        assertTrue(usuario.isEnabled());
        assertEquals("ROLE_ADMINISTRADOR", usuario.getAuthorities().iterator().next().getAuthority());
        assertTrue(usuario.toString().contains("user@test.com"));
        assertEquals(usuario, usuario);
        assertNotEquals(usuario, new RefreshToken());
        usuario.setAtivo(null);
        assertFalse(usuario.isEnabled());
        usuario.setAtivo(false);
        assertFalse(usuario.isEnabled());
    }

    @Test
    void refreshTokenGettersSettersEqualsEToString() {
        Usuario usuario = new Usuario();
        RefreshToken token = new RefreshToken();
        Date validade = new Date();
        Date revogacao = new Date();
        token.setHash("hash");
        token.setFamilia("family");
        token.setUsuarioId(usuario);
        token.setValidade(validade);
        token.setRevogacao(revogacao);

        assertEquals("hash", token.getHash());
        assertEquals("family", token.getFamilia());
        assertSame(usuario, token.getUsuarioId());
        assertSame(validade, token.getValidade());
        assertSame(revogacao, token.getRevogacao());
        assertEquals(token, token);
        assertNotEquals(token, new Usuario());
        assertTrue(token.toString().contains("family"));
        assertEquals(List.of(Perfil.values()), List.of(Perfil.USUARIO, Perfil.ADMINISTRADOR, Perfil.SUPERUSUARIO));
    }
}
