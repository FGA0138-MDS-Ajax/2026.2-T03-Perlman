package br.com.motivafit.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI motivaFitOpenApi(
            @Value("${openapi.server-url:http://localhost:8080}") String serverUrl) {
        return new OpenAPI()
                .info(new Info()
                        .title("MotivaFit API")
                        .version("1.0.0")
                        .description("API REST do MotivaFit. Atualmente estão disponíveis cadastro e autenticação por e-mail e senha, renovação rotativa de sessão e logout. "
                                + "O token de acesso JWT é retornado no corpo da resposta e tem validade configurável por JWT_EXPIRATION_MINUTES (15 minutos por padrão). "
                                + "O refresh token opaco é entregue em cookie HttpOnly, Secure e SameSite=Lax, com validade configurável por JWT_REFRESH_EXPIRATION_DAYS (7 dias por padrão). "
                                + "Refresh e logout exigem o cookie csrfToken, o cabeçalho X-CSRF-TOKEN com o mesmo valor e o cabeçalho Origin correspondente a CORS_ALLOWED_ORIGIN.")
                        .contact(new Contact().name("Equipe MotivaFit"))
                        .license(new License().name("Uso interno")))
                .servers(List.of(new Server().url(serverUrl).description("Servidor configurado para esta instalação")))
                .components(new Components()
                        .addSecuritySchemes("AccessToken",
                                new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")
                                        .description("JWT de acesso retornado pelo endpoint /api/auth/login ou /api/auth/refresh."))
                        .addSecuritySchemes("RefreshTokenCookie",
                                new SecurityScheme().type(SecurityScheme.Type.APIKEY).in(SecurityScheme.In.COOKIE)
                                        .name("refreshToken").description("Cookie HttpOnly emitido no login e rotacionado no refresh."))
                        );
    }
}
