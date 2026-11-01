package br.com.motivafit.dto.request;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ConviteRequestDTOTest {
    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void closeValidator() {
        factory.close();
    }

    @Test
    void aceitaCriacaoDeConviteComIdEEmailValidos() {
        assertTrue(validator.validate(new ConviteAdminRequestDTO(1L, "pessoa@exemplo.com")).isEmpty());
    }

    @Test
    void rejeitaIdAusenteOuNaoPositivo() {
        assertFalse(validator.validate(new ConviteAdminRequestDTO(null, "pessoa@exemplo.com")).isEmpty());
        assertFalse(validator.validate(new ConviteAdminRequestDTO(0L, "pessoa@exemplo.com")).isEmpty());
    }

    @Test
    void rejeitaEmailAusenteInvalidoOuMaiorQue254Caracteres() {
        assertFalse(validator.validate(new ConviteAdminRequestDTO(1L, " ")).isEmpty());
        assertFalse(validator.validate(new ConviteAdminRequestDTO(1L, "email-invalido")).isEmpty());
        String emailLongo = "a".repeat(243) + "@b.com";
        assertEquals(249, emailLongo.length());
        String acimaDoLimite = "a".repeat(249) + "@b.com";
        assertFalse(validator.validate(new ConviteAdminRequestDTO(1L, acimaDoLimite)).isEmpty());
    }

    @Test
    void aceitaTokenUrlSafeDe43Caracteres() {
        String token = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG";
        assertEquals(43, token.length());
        assertTrue(validator.validate(new AceitarConviteRequestDTO(1L, token)).isEmpty());
    }

    @Test
    void rejeitaIdETokenInvalidos() {
        assertFalse(validator.validate(new AceitarConviteRequestDTO(null, "x".repeat(43))).isEmpty());
        assertFalse(validator.validate(new AceitarConviteRequestDTO(0L, "x".repeat(43))).isEmpty());
        assertFalse(validator.validate(new AceitarConviteRequestDTO(1L, " ")).isEmpty());
        assertFalse(validator.validate(new AceitarConviteRequestDTO(1L, "x".repeat(42))).isEmpty());
        assertFalse(validator.validate(new AceitarConviteRequestDTO(1L, "x".repeat(42) + ".")).isEmpty());
    }
}
