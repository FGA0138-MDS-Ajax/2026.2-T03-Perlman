package br.com.motivafit.dto.response;

import br.com.motivafit.enums.Modalidade;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Exercício do desafio e suas metas")
public record DesafioItemResponseDTO(
        @Schema(description = "Identificador do item", example = "5")
        Long id,
        @Schema(description = "Id do exercício no catálogo", example = "1")
        Long catalogoId,
        @Schema(description = "Nome do exercício no catálogo", example = "Supino reto")
        String exercicioNome,
        @Schema(description = "Modalidade do exercício", example = "MUSCULACAO")
        Modalidade modalidade,
        @Schema(description = "Meta de carga em quilos", example = "80", nullable = true)
        BigDecimal metaCargaKg,
        @Schema(description = "Meta de repetições", example = "100", nullable = true)
        Integer metaRepeticoes,
        @Schema(description = "Meta de séries", example = "3", nullable = true)
        Integer metaSeries,
        @Schema(description = "Meta de tempo em segundos", example = "1800", nullable = true)
        Integer metaTempoS,
        @Schema(description = "Meta de distância em metros", example = "5000", nullable = true)
        BigDecimal metaDistanciaM
) {
}