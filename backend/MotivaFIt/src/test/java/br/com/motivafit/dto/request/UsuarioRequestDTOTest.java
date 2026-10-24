package br.com.motivafit.dto.request;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UsuarioRequestDTOTest {
    private static Validator validator;
    private static jakarta.validation.ValidatorFactory validatorFactory;

    @BeforeAll
    static void criarValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void fecharValidator() {
        validatorFactory.close();
    }

    @Test
    void aceitaSenhaForteComOuSemEspacosInternos() {
        assertTrue(validator.validate(new UsuarioRequestDTO("user@test.com", "SenhaSegura123!")).isEmpty());
        assertTrue(validator.validate(new UsuarioRequestDTO("user@test.com", "Forte com 12?x")).isEmpty());
    }

    @Test
    void rejeitaSenhaCurtaOuSemAlgumRequisitoDeForca() {
        for (String senha : new String[]{
                "Senha123!", "senha123456!", "SENHA123456!", "Senhaabcdefghijkl!", "Senha1234567890"
        }) {
            var violations = validator.validate(new UsuarioRequestDTO("user@test.com", senha));
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("senha")),
                    "A senha fraca deveria ser rejeitada: " + senha);
        }
    }
}
