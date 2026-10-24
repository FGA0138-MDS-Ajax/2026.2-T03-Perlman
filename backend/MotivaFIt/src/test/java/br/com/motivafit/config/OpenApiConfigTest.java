package br.com.motivafit.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class OpenApiConfigTest {
    @Test
    void configuraInformacoesServidorEEsquemasDeSeguranca() {
        var openApi = new OpenApiConfig().motivaFitOpenApi("https://api.test");

        assertEquals("MotivaFit API", openApi.getInfo().getTitle());
        assertEquals("1.0.0", openApi.getInfo().getVersion());
        assertTrue(openApi.getInfo().getDescription().contains("JWT_EXPIRATION_MINUTES"));
        assertEquals("https://api.test", openApi.getServers().getFirst().getUrl());
        assertEquals(2, openApi.getComponents().getSecuritySchemes().size());
        assertEquals("bearer", openApi.getComponents().getSecuritySchemes().get("AccessToken").getScheme());
        assertEquals("refreshToken", openApi.getComponents().getSecuritySchemes().get("RefreshTokenCookie").getName());
    }
}
