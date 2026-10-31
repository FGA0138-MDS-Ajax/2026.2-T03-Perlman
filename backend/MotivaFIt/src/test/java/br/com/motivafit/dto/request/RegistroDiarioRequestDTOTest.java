package br.com.motivafit.dto.request;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

class RegistroDiarioRequestDTOTest {
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
    void aceitaRegistroMinimoEmusculacaoCompletaEAerobico() {
        assertTrue(campos(new RegistroDiarioRequestDTO(1L, null, null, null, null, null, 600, null, null, null)).isEmpty());
        assertTrue(campos(new RegistroDiarioRequestDTO(1L, 10L, 30L, BigDecimal.ZERO, 8, 3, 1200, null, null, "chave")).isEmpty());
        assertTrue(campos(new RegistroDiarioRequestDTO(1L, null, null, null, null, null, 1800, new BigDecimal("5000.50"), null, null)).isEmpty());
    }

    @Test
    void exigeExercicioDoCatalogoETempo() {
        Set<String> campos = campos(new RegistroDiarioRequestDTO(null, null, null, null, null, null, null, null, null, null));

        assertEquals(Set.of("catalogoId", "tempoS"), campos);
    }

    @Test
    void rejeitaIdsZeradosOuNegativos() {
        Set<String> campos = campos(new RegistroDiarioRequestDTO(0L, -1L, 0L, null, null, null, 600, null, null, null));

        assertEquals(Set.of("catalogoId", "treinoId", "exercicioId"), campos);
    }

    @Test
    void rejeitaValoresNumericosInvalidos() {
        Set<String> campos = campos(new RegistroDiarioRequestDTO(1L, null, null,
                new BigDecimal("-1"), 0, -2, 0, BigDecimal.ZERO, null, null));

        assertEquals(Set.of("cargaKg", "repeticoes", "series", "tempoS", "distanciaM"), campos);
    }

    @Test
    void rejeitaCargaEDistanciaComDigitosAlemDoBanco() {
        Set<String> campos = campos(new RegistroDiarioRequestDTO(1L, null, null,
                new BigDecimal("1234567"), null, null, 600, new BigDecimal("123456789"), null, null));

        assertEquals(Set.of("cargaKg", "distanciaM"), campos);
    }

    @Test
    void rejeitaChaveDeIdempotenciaComMaisDe100Caracteres() {
        assertTrue(campos(new RegistroDiarioRequestDTO(1L, null, null, null, null, null, 600, null, null, "a".repeat(100))).isEmpty());
        assertEquals(Set.of("chaveIdempotencia"),
                campos(new RegistroDiarioRequestDTO(1L, null, null, null, null, null, 600, null, null, "a".repeat(101))));
    }

    private Set<String> campos(RegistroDiarioRequestDTO dto) {
        return validator.validate(dto).stream()
                .map(ConstraintViolation::getPropertyPath)
                .map(Object::toString)
                .collect(Collectors.toSet());
    }
}