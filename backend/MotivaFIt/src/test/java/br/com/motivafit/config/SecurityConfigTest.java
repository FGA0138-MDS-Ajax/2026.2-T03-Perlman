package br.com.motivafit.config;

import br.com.motivafit.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class SecurityConfigTest {
    @Test
    void configuraCorsComOrigemExplicitaECredenciais() {
        SecurityConfig config = new SecurityConfig(mock(JwtAuthenticationFilter.class), "https://frontend.test");
        var cors = config.corsConfigurationSource().getCorsConfiguration(
                new org.springframework.mock.web.MockHttpServletRequest("GET", "/api/treinos"));

        assertEquals(java.util.List.of("https://frontend.test"), cors.getAllowedOrigins());
        assertTrue(cors.getAllowCredentials());
        assertTrue(cors.getAllowedMethods().contains("POST"));
        assertTrue(cors.getAllowedHeaders().contains("X-CSRF-TOKEN"));
        assertNotNull(config.passwordEncoder().encode("senha"));
    }
}
