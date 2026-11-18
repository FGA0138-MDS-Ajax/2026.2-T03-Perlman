package br.com.motivafit.dto.request;

import br.com.motivafit.enums.Modalidade;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class CatalogoExercicioRequestDTOTest {
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
    void aceitaExercicioValidoNosLimitesDeTamanho() {
        assertTrue(validator.validate(
                new CatalogoExercicioRequestDTO("Remada cavalinho", Modalidade.MUSCULACAO, "Costas")).isEmpty());
        assertTrue(validator.validate(
                new CatalogoExercicioRequestDTO("a".repeat(100), Modalidade.AEROBICO, "b".repeat(50))).isEmpty());
    }

    @Test
    void rejeitaNomeNuloVazioOuSoComEspacos() {
        for (String nome : new String[]{null, "", "   "}) {
            assertTrue(temViolacaoEm("nome",
                            validator.validate(new CatalogoExercicioRequestDTO(nome, Modalidade.MUSCULACAO, "Costas"))),
                    "Nome inválido deveria ser rejeitado: '" + nome + "'");
        }
    }

    @Test
    void rejeitaNomeComMaisDe100Caracteres() {
        assertTrue(temViolacaoEm("nome", validator.validate(
                new CatalogoExercicioRequestDTO("a".repeat(101), Modalidade.MUSCULACAO, "Costas"))));
    }

    @Test
    void rejeitaModalidadeAusente() {
        var violations = validator.validate(new CatalogoExercicioRequestDTO("Stiff", null, "Costas"));

        assertEquals(1, violations.size());
        assertEquals("modalidade", violations.iterator().next().getPropertyPath().toString());
    }

    @Test
    void rejeitaGrupoMuscularNuloVazioOuMuitoLongo() {
        for (String grupo : new String[]{null, "", "  ", "b".repeat(51)}) {
            assertTrue(temViolacaoEm("grupoMuscular",
                            validator.validate(new CatalogoExercicioRequestDTO("Stiff", Modalidade.MUSCULACAO, grupo))),
                    "Grupo muscular inválido deveria ser rejeitado: '" + grupo + "'");
        }
    }

    private boolean temViolacaoEm(String campo, Set<ConstraintViolation<CatalogoExercicioRequestDTO>> violations) {
        return violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals(campo));
    }
}