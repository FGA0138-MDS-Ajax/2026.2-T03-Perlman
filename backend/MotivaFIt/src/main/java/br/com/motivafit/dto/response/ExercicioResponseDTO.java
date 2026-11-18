package br.com.motivafit.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Exercício retornado pela API")
public record ExercicioResponseDTO(
        @Schema(description = "Identificador do exercício", example = "1")
        Long id,

        @Schema(description = "Meta do exercício", example = "3 séries de 12 repetições")
        String meta,

        @Schema(description = "Meta recorde do exercício", example = "50kg")
        String metaRecorde,

        @Schema(description = "Identificador do treino associado", example = "1")
        Long treinoId,

        @Schema(description = "Identificador do exercício no catálogo", example = "2")
        Long catalogoExercicioId
) {}