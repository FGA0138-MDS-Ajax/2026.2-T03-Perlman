package br.com.motivafit.dto.request;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ExercicioRequestDTOTest {
    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void criarValidator() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void fecharValidator() {
        factory.close();
    }

    @Test
    void aceitaRequestValidoComRecordeOpcional() {
        var request = new ExercicioRequestDTO("3 séries de 12", null, 1L, 2L);

        assertTrue(validator.validate(request).isEmpty());
    }

    @Test
    void rejeitaMetaAusenteOuEmBranco() {
        assertFalse(validator.validate(new ExercicioRequestDTO(null, null, 1L, 2L)).isEmpty());
        assertFalse(validator.validate(new ExercicioRequestDTO("  ", null, 1L, 2L)).isEmpty());
    }

    @Test
    void rejeitaMetaERecordeAcimaDoLimite() {
        assertFalse(validator.validate(new ExercicioRequestDTO("m".repeat(256), null, 1L, 2L)).isEmpty());
        assertFalse(validator.validate(new ExercicioRequestDTO("Meta", "r".repeat(256), 1L, 2L)).isEmpty());
    }

    @Test
    void exigeIdsDoTreinoEDoCatalogo() {
        assertFalse(validator.validate(new ExercicioRequestDTO("Meta", null, null, 2L)).isEmpty());
        assertFalse(validator.validate(new ExercicioRequestDTO("Meta", null, 1L, null)).isEmpty());
    }
}
