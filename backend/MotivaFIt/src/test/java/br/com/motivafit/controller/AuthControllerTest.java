package br.com.motivafit.controller;

import br.com.motivafit.dto.request.LoginRequestDTO;
import br.com.motivafit.dto.request.UsuarioRequestDTO;
import br.com.motivafit.dto.response.LoginResponseDTO;
import br.com.motivafit.dto.response.UsuarioResponseDTO;
import br.com.motivafit.enums.Perfil;
import br.com.motivafit.exception.AcessoNegadoException;
import br.com.motivafit.service.LoginService;
import br.com.motivafit.service.UsuarioService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthControllerTest {
    private UsuarioService usuarios;
    private LoginService login;
    private AuthController controller;

    @BeforeEach
    void setup() {
        usuarios = mock(UsuarioService.class);
        login = mock(LoginService.class);
        controller = new AuthController(usuarios, login, 7, "https://frontend.test");
    }

    @Test
    void cadastroRetorna201ComUsuario() {
        UsuarioResponseDTO dto = new UsuarioResponseDTO(1L, "user@test.com", Perfil.USUARIO, true);
        when(usuarios.create(any())).thenReturn(dto);

        var response = controller.create(new UsuarioRequestDTO("user@test.com", "senha"));

        assertEquals(201, response.getStatusCode().value());
        assertSame(dto, response.getBody());
    }

    @Test
    void loginRetornaAccessTokenECookiesSeguros() {
        LoginResponseDTO dto = new LoginResponseDTO("access", new Date());
        when(login.login(any(LoginRequestDTO.class))).thenReturn(new LoginService.LoginResult(dto, "refresh"));

        var response = controller.login(new LoginRequestDTO("user@test.com", "senha"));

        assertEquals(200, response.getStatusCode().value());
        assertSame(dto, response.getBody());
        var cookies = response.getHeaders().get("Set-Cookie");
        assertEquals(2, cookies.size());
        assertTrue(cookies.stream().anyMatch(cookie -> cookie.contains("refreshToken=refresh")
                && cookie.contains("HttpOnly") && cookie.contains("Secure") && cookie.contains("SameSite=Lax")));
        assertTrue(cookies.stream().anyMatch(cookie -> cookie.contains("csrfToken=") && !cookie.contains("HttpOnly")));
    }

    @Test
    void refreshValidaOriginCsrfERotacionaCookies() {
        MockHttpServletRequest request = validRequest();
        LoginResponseDTO dto = new LoginResponseDTO("new-access", new Date());
        when(login.refresh("old-refresh")).thenReturn(new LoginService.LoginResult(dto, "new-refresh"));

        var response = controller.refresh(request);

        assertSame(dto, response.getBody());
        verify(login).refresh("old-refresh");
        assertTrue(response.getHeaders().get("Set-Cookie").stream()
                .anyMatch(cookie -> cookie.contains("refreshToken=new-refresh")));
    }

    @Test
    void logoutRevogaSessaoEExpiraCookies() {
        MockHttpServletRequest request = validRequest();

        var response = controller.logout(request);

        assertEquals(204, response.getStatusCode().value());
        verify(login).logout("old-refresh");
        assertTrue(response.getHeaders().get("Set-Cookie").stream().allMatch(cookie -> cookie.contains("Max-Age=0")));
    }

    @Test
    void refreshELogoutRejeitamOrigemOuCsrfInvalido() {
        MockHttpServletRequest wrongOrigin = validRequest("https://evil.test", "csrf-value");
        assertThrows(AcessoNegadoException.class, () -> controller.refresh(wrongOrigin));
        assertThrows(AcessoNegadoException.class, () -> controller.logout(wrongOrigin));

        MockHttpServletRequest wrongCsrf = validRequest("https://frontend.test", "different");
        assertThrows(AcessoNegadoException.class, () -> controller.refresh(wrongCsrf));
    }

    private MockHttpServletRequest validRequest() {
        return validRequest("https://frontend.test", "csrf-value");
    }

    private MockHttpServletRequest validRequest(String origin, String csrfHeader) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Origin", origin);
        request.addHeader("X-CSRF-TOKEN", csrfHeader);
        request.setCookies(new Cookie("refreshToken", "old-refresh"), new Cookie("csrfToken", "csrf-value"));
        return request;
    }
}
