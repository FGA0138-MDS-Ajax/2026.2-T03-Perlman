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
import br.com.motivafit.exception.AcessoNegadoException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.headers.Header;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import br.com.motivafit.exception.ApiErroResponse;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticação", description = "Cadastro, login, renovação rotativa e encerramento de sessão")
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
    @Operation(summary = "Cadastrar usuário", description = "Cria uma conta com perfil USUARIO. A senha é armazenada como hash.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Conta criada", content = @Content(schema = @Schema(implementation = UsuarioResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "409", description = "E-mail já cadastrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<UsuarioResponseDTO> create(@RequestBody @Valid UsuarioRequestDTO body){
        UsuarioResponseDTO response = usuarioService.create(body);
        return ResponseEntity.status(HttpStatusCode.valueOf(201)).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Autenticar usuário", description = "Valida e-mail e senha. Retorna o JWT de acesso no corpo e define os cookies refreshToken e csrfToken.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Autenticação realizada; cookies de sessão definidos", headers = @Header(name = "Set-Cookie", description = "Define os cookies refreshToken (HttpOnly) e csrfToken (legível pelo cliente)."), content = @Content(schema = @Schema(implementation = LoginResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Credenciais inválidas ou conta inativa", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<LoginResponseDTO> login (@RequestBody @Valid LoginRequestDTO body){
        LoginService.LoginResult result = loginService.login(body);
        String csrf = csrfToken();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie(result.refreshToken()).toString())
                .header(HttpHeaders.SET_COOKIE, csrfCookie(csrf).toString())
                .body(result.response());
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar sessão", description = "Consome o refresh token atual, revoga-o e emite outro token da mesma família. O refresh token é recebido pelo cookie HttpOnly e o novo valor é enviado em Set-Cookie.",
            security = @SecurityRequirement(name = "RefreshTokenCookie"),
            parameters = {
                    @Parameter(name = "csrfToken", in = ParameterIn.COOKIE, required = true, description = "Cookie CSRF definido no login."),
                    @Parameter(name = "X-CSRF-TOKEN", in = ParameterIn.HEADER, required = true, description = "Mesmo valor do cookie csrfToken."),
                    @Parameter(name = "Origin", in = ParameterIn.HEADER, required = true, description = "Deve corresponder exatamente à origem configurada em CORS_ALLOWED_ORIGIN.")
            })
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Sessão renovada e refresh token rotacionado", headers = @Header(name = "Set-Cookie", description = "Substitui refreshToken e csrfToken pelos novos valores."), content = @Content(schema = @Schema(implementation = LoginResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Refresh token ausente, inválido, expirado ou reutilizado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "403", description = "Origem ou validação CSRF inválida", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
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
    @Operation(summary = "Encerrar sessão", description = "Revoga a família do refresh token e expira os cookies refreshToken e csrfToken.",
            security = @SecurityRequirement(name = "RefreshTokenCookie"),
            parameters = {
                    @Parameter(name = "csrfToken", in = ParameterIn.COOKIE, required = true, description = "Cookie CSRF definido no login."),
                    @Parameter(name = "X-CSRF-TOKEN", in = ParameterIn.HEADER, required = true, description = "Mesmo valor do cookie csrfToken."),
                    @Parameter(name = "Origin", in = ParameterIn.HEADER, required = true, description = "Deve corresponder exatamente à origem configurada em CORS_ALLOWED_ORIGIN.")
            })
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Sessão encerrada; cookies expirados", headers = @Header(name = "Set-Cookie", description = "Expira os cookies refreshToken e csrfToken.")),
            @ApiResponse(responseCode = "403", description = "Origem ou validação CSRF inválida", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
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
            throw new AcessoNegadoException("CSRF_INVALIDO", "Origem ou token de segurança inválido");
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
