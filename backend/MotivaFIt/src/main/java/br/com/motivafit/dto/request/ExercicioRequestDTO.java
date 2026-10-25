package br.com.motivafit.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para cadastrar ou alterar um exercício")
public record ExercicioRequestDTO(
        @NotBlank(message = "A meta é obrigatória")
        @Size(max = 255, message = "A meta deve ter no máximo 255 caracteres")
        @Schema(description = "Meta do exercício", example = "3 séries de 12 repetições")
        String meta,

        @Size(max = 255, message = "O recorde deve ter no máximo 255 caracteres")
        @Schema(description = "Meta recorde do exercício", example = "50kg")
        String metaRecorde,

        @NotNull(message = "O ID do treino é obrigatório")
        @Schema(description = "Identificador do treino associado", example = "1")
        Long treinoId,

        @NotNull(message = "O ID do catálogo de exercício é obrigatório")
        @Schema(description = "Identificador do exercício no catálogo", example = "2")
        Long catalogoExercicioId
) {}