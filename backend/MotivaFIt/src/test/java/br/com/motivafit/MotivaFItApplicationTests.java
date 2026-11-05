package br.com.motivafit;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.TestPropertySource;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.http.MediaType;

@Import(TestcontainersConfiguration.class)
@TestPropertySource(properties = {
        "JWT_SECRET=motivafit-tests-only-secret-key-with-more-than-32-bytes",
        "JWT_ISSUER=motivafit-test"
})
@AutoConfigureMockMvc
@SpringBootTest
class MotivaFItApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void contextLoads() {
    }

    @Test
    void publicaDocumentacaoOpenApiComTodasAsRotasDeAutenticacao() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").value("MotivaFit API"))
                .andExpect(jsonPath("$.paths['/api/auth/cadastro']").exists())
                .andExpect(jsonPath("$.paths['/api/auth/login']").exists())
                .andExpect(jsonPath("$.paths['/api/auth/refresh']").exists())
                .andExpect(jsonPath("$.paths['/api/auth/logout']").exists())
                .andExpect(jsonPath("$.components.securitySchemes.RefreshTokenCookie").exists());
    }

    @Test
    void cadastroCodificaSenhaAtravésDoMapperInjetado() throws Exception {
        mockMvc.perform(post("/api/auth/cadastro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"cadastro-test@motivafit.com\",\"senha\":\"SenhaSegura123!\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("cadastro-test@motivafit.com"))
                .andExpect(jsonPath("$.perfil").value("USUARIO"))
                .andExpect(jsonPath("$.ativo").value(true));
    }

}
