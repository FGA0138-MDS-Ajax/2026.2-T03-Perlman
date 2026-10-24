package br.com.motivafit.controller;

import br.com.motivafit.dto.request.LoginRequestDTO;
import br.com.motivafit.dto.request.UsuarioRequestDTO;
import br.com.motivafit.dto.response.LoginResponseDTO;
import br.com.motivafit.dto.response.UsuarioResponseDTO;
import br.com.motivafit.service.LoginService;
import br.com.motivafit.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.beans.factory.annotation.Value;
import jakarta.servlet.http.HttpServletRequest;
import java.security.SecureRandom;
import java.util.Base64;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UsuarioService usuarioService;
    private final LoginService loginService;
    private final long refreshCookieMaxAge;
    private final String allowedOrigin;
    private final SecureRandom random = new SecureRandom();

    public AuthController(UsuarioService usuarioService, LoginService loginService,
                          @Value("${security.jwt.refresh-expiration-days:7}") long refreshDays,
                          @Value("${security.cors.allowed-origin:http://localhost:3000}") String allowedOrigin) {
        this.usuarioService = usuarioService;
        this.loginService = loginService;
        this.refreshCookieMaxAge = refreshDays * 86400;
        this.allowedOrigin = allowedOrigin;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<UsuarioResponseDTO> create(@RequestBody @Valid UsuarioRequestDTO body){
        UsuarioResponseDTO response = usuarioService.create(body);
        return ResponseEntity.status(HttpStatusCode.valueOf(201)).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login (@RequestBody @Valid LoginRequestDTO body){
        LoginService.LoginResult result = loginService.login(body);
        String csrf = csrfToken();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie(result.refreshToken()).toString())
                .header(HttpHeaders.SET_COOKIE, csrfCookie(csrf).toString())
                .body(result.response());
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDTO> refresh(HttpServletRequest request) {
        validarOrigemECsrf(request);
        LoginService.LoginResult result = loginService.refresh(cookie(request, "refreshToken"));
        String csrf = csrfToken();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie(result.refreshToken()).toString())
                .header(HttpHeaders.SET_COOKIE, csrfCookie(csrf).toString())
                .body(result.response());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        validarOrigemECsrf(request);
        loginService.logout(cookie(request, "refreshToken"));
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, expiredCookie("refreshToken", true).toString())
                .header(HttpHeaders.SET_COOKIE, expiredCookie("csrfToken", false).toString())
                .build();
    }

    private void validarOrigemECsrf(HttpServletRequest request) {
        String origin = request.getHeader("Origin");
        String csrfCookie = cookie(request, "csrfToken");
        String csrfHeader = request.getHeader("X-CSRF-TOKEN");
        if (!allowedOrigin.equals(origin) || csrfCookie == null || !csrfCookie.equals(csrfHeader))
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Origem ou token CSRF inválido");
    }

    private String cookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (var cookie : request.getCookies()) if (name.equals(cookie.getName())) return cookie.getValue();
        return null;
    }

    private String csrfToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private ResponseCookie refreshCookie(String value) {
        return ResponseCookie.from("refreshToken", value).httpOnly(true).secure(true)
                .sameSite("Lax").path("/api/auth").maxAge(refreshCookieMaxAge).build();
    }

    private ResponseCookie csrfCookie(String value) {
        return ResponseCookie.from("csrfToken", value).httpOnly(false).secure(true)
                .sameSite("Lax").path("/api/auth").maxAge(refreshCookieMaxAge).build();
    }

    private ResponseCookie expiredCookie(String name, boolean httpOnly) {
        return ResponseCookie.from(name, "").httpOnly(httpOnly).secure(true)
                .sameSite("Lax").path("/api/auth").maxAge(0).build();
    }
}
