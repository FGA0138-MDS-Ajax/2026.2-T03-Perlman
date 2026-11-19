package br.com.motivafit.dto.request;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

class DesafioRequestDTOTest {
    private static final LocalDate PRAZO = LocalDate.of(2026, 12, 15);

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
    void aceitaDesafioValidoEComTituloNoLimite() {
        assertTrue(campos(new DesafioRequestDTO("Desafio", PRAZO, List.of(itemValido()))).isEmpty());
        assertTrue(campos(new DesafioRequestDTO("a".repeat(100), PRAZO, List.of(itemValido()))).isEmpty());
    }

    @Test
    void rejeitaTituloNuloVazioOuMuitoLongo() {
        for (String titulo : new String[]{null, "", "   ", "a".repeat(101)}) {
            assertEquals(Set.of("titulo"), campos(new DesafioRequestDTO(titulo, PRAZO, List.of(itemValido()))),
                    "Título inválido deveria ser rejeitado: '" + titulo + "'");
        }
    }

    @Test
    void exigeOPrazo() {
        assertEquals(Set.of("prazo"), campos(new DesafioRequestDTO("Desafio", null, List.of(itemValido()))));
    }

    @Test
    void exigeAoMenosUmExercicioEAceitaNoMaximoVinte() {
        assertEquals(Set.of("itens"), campos(new DesafioRequestDTO("Desafio", PRAZO, null)));
        assertEquals(Set.of("itens"), campos(new DesafioRequestDTO("Desafio", PRAZO, List.of())));
        assertEquals(Set.of("itens"),
                campos(new DesafioRequestDTO("Desafio", PRAZO, Collections.nCopies(21, itemValido()))));
        assertTrue(campos(new DesafioRequestDTO("Desafio", PRAZO, Collections.nCopies(20, itemValido()))).isEmpty());
    }

    @Test
    void validaCadaItemDaLista() {
        var itemRuim = new DesafioItemRequestDTO(null, new BigDecimal("-1"), 0, -2, 0, BigDecimal.ZERO);

        Set<String> campos = campos(new DesafioRequestDTO("Desafio", PRAZO, List.of(itemValido(), itemRuim)));

        assertEquals(Set.of("itens[1].catalogoId", "itens[1].metaCargaKg", "itens[1].metaRepeticoes",
                "itens[1].metaSeries", "itens[1].metaTempoS", "itens[1].metaDistanciaM"), campos);
    }

    @Test
    void rejeitaIdDeCatalogoZeradoOuNegativo() {
        assertEquals(Set.of("itens[0].catalogoId"), campos(new DesafioRequestDTO("Desafio", PRAZO,
                List.of(new DesafioItemRequestDTO(0L, null, 100, null, null, null)))));
        assertEquals(Set.of("itens[0].catalogoId"), campos(new DesafioRequestDTO("Desafio", PRAZO,
                List.of(new DesafioItemRequestDTO(-5L, null, 100, null, null, null)))));
    }

    @Test
    void aceitaMetaDeCargaZeroEMetasNosLimitesDeDigitos() {
        var item = new DesafioItemRequestDTO(1L, BigDecimal.ZERO, 1, 1, 1, new BigDecimal("12345678.99"));

        assertTrue(campos(new DesafioRequestDTO("Desafio", PRAZO, List.of(item))).isEmpty());
    }

    @Test
    void rejeitaMetasComDigitosAlemDoBanco() {
        var item = new DesafioItemRequestDTO(1L, new BigDecimal("1234567"), null, null, null, new BigDecimal("123456789"));

        assertEquals(Set.of("itens[0].metaCargaKg", "itens[0].metaDistanciaM"),
                campos(new DesafioRequestDTO("Desafio", PRAZO, List.of(item))));
    }

    private DesafioItemRequestDTO itemValido() {
        return new DesafioItemRequestDTO(1L, null, 100, null, null, null);
    }

    private Set<String> campos(DesafioRequestDTO dto) {
        return validator.validate(dto).stream()
                .map(ConstraintViolation::getPropertyPath)
                .map(Object::toString)
                .collect(Collectors.toSet());
    }
}