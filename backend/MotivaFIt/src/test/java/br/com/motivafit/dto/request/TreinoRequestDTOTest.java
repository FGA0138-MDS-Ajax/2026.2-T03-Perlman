package br.com.motivafit.dto.request;

import br.com.motivafit.enums.TipoTreino;
import br.com.motivafit.enums.Visibilidade;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class TreinoRequestDTOTest {
    private static ValidatorFactory validatorFactory;
    private static Validator validator;

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
    void aceitaTreinoCompletoOuSemVisibilidade() {
        assertTrue(validator.validate(new TreinoRequestDTO("Treino A", TipoTreino.MUSCULACAO, Visibilidade.PUBLICO)).isEmpty());
        assertTrue(validator.validate(new TreinoRequestDTO("Treino A", TipoTreino.AEROBICO, null)).isEmpty());
    }

    @Test
    void aceitaNomeComExatamente150Caracteres() {
        String nome = "a".repeat(150);

        assertTrue(validator.validate(new TreinoRequestDTO(nome, TipoTreino.MUSCULACAO, null)).isEmpty());
    }

    @Test
    void rejeitaNomeNuloVazioOuSoComEspacos() {
        for (String nome : new String[]{null, "", "   "}) {
            Set<ConstraintViolation<TreinoRequestDTO>> violations =
                    validator.validate(new TreinoRequestDTO(nome, TipoTreino.MUSCULACAO, null));

            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("nome")),
                    "Nome inválido deveria ser rejeitado: '" + nome + "'");
        }
    }

    @Test
    void rejeitaNomeComMaisDe150Caracteres() {
        var violations = validator.validate(new TreinoRequestDTO("a".repeat(151), TipoTreino.MUSCULACAO, null));

        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("nome")));
    }

    @Test
    void rejeitaTipoAusente() {
        var violations = validator.validate(new TreinoRequestDTO("Treino A", null, null));

        assertEquals(1, violations.size());
        assertEquals("tipo", violations.iterator().next().getPropertyPath().toString());
    }
}