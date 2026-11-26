package br.com.motivafit.security;

import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.Perfil;
import br.com.motivafit.exception.NaoAutorizadoException;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtAuthenticationFilterTest {
    @AfterEach
    void clearContext() { SecurityContextHolder.clearContext(); }

    @Test
    void semBearerSegueSemAutenticar() throws Exception {
        JwtService jwt = mock(JwtService.class);
        UserDetailsService users = mock(UserDetailsService.class);
        var filter = new JwtAuthenticationFilter(jwt, users);
        var request = new MockHttpServletRequest();
        var response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verifyNoInteractions(jwt, users);
    }

    @Test
    void tokenValidoDeUsuarioAtivoAutentica() throws Exception {
        JwtService jwt = mock(JwtService.class);
        UserDetailsService users = mock(UserDetailsService.class);
        Usuario user = new Usuario();
        user.setEmail("active@test.com");
        user.setAtivo(true);
        user.setPerfil(Perfil.USUARIO);
        when(jwt.extractEmail("valid")).thenReturn("active@test.com");
        when(jwt.isTokenValid("valid")).thenReturn(true);
        when(users.loadUserByUsername("active@test.com")).thenReturn(user);
        var filter = new JwtAuthenticationFilter(jwt, users);
        var request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer valid");

        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals("active@test.com", SecurityContextHolder.getContext().getAuthentication().getName());
    }

    @Test
    void tokenInvalidoUsuarioInativoEExcecaoSeguemSemAutenticar() throws Exception {
        JwtService jwt = mock(JwtService.class);
        UserDetailsService users = mock(UserDetailsService.class);
        Usuario inactive = new Usuario();
        inactive.setAtivo(false);
        inactive.setPerfil(Perfil.USUARIO);
        when(jwt.extractEmail("invalid")).thenReturn("user@test.com");
        when(jwt.isTokenValid("invalid")).thenReturn(false);
        when(jwt.extractEmail("inactive")).thenReturn("inactive@test.com");
        when(jwt.isTokenValid("inactive")).thenReturn(true);
        when(users.loadUserByUsername("inactive@test.com")).thenReturn(inactive);
        when(jwt.extractEmail("exception")).thenThrow(new NaoAutorizadoException("TOKEN", "Token inválido"));
        var filter = new JwtAuthenticationFilter(jwt, users);

        for (String token : new String[]{"invalid", "inactive", "exception"}) {
            var request = new MockHttpServletRequest();
            request.addHeader("Authorization", "Bearer " + token);
            filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());
            assertNull(SecurityContextHolder.getContext().getAuthentication());
        }
    }
}
