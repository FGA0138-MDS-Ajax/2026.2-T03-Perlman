package br.com.motivafit.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

@Schema(description = "Exercício do catálogo com as metas numéricas que fazem parte do desafio")
public record DesafioItemRequestDTO(
        @NotNull(message = "O exercício do catálogo é obrigatório")
        @Positive(message = "O id do exercício do catálogo deve ser positivo")
        @Schema(description = "Id do exercício no catálogo", example = "1")
        Long catalogoId,

        @DecimalMin(value = "0.0", message = "A meta de carga não pode ser negativa")
        @Digits(integer = 6, fraction = 2, message = "A meta de carga deve ter no máximo 6 dígitos inteiros e 2 decimais")
        @Schema(description = "Meta de carga em quilos. Apenas para musculação.", example = "80", nullable = true)
        BigDecimal metaCargaKg,

        @Positive(message = "A meta de repetições deve ser maior que zero")
        @Schema(description = "Meta de repetições. Apenas para musculação.", example = "100", nullable = true)
        Integer metaRepeticoes,

        @Positive(message = "A meta de séries deve ser maior que zero")
        @Schema(description = "Meta de séries. Apenas para musculação.", example = "3", nullable = true)
        Integer metaSeries,

        @Positive(message = "A meta de tempo deve ser maior que zero")
        @Schema(description = "Meta de tempo em segundos", example = "1800", nullable = true)
        Integer metaTempoS,

        @DecimalMin(value = "0.0", inclusive = false, message = "A meta de distância deve ser maior que zero")
        @Digits(integer = 8, fraction = 2, message = "A meta de distância deve ter no máximo 8 dígitos inteiros e 2 decimais")
        @Schema(description = "Meta de distância em metros. Apenas para exercícios aeróbicos.", example = "5000", nullable = true)
        BigDecimal metaDistanciaM
) {
}