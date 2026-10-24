package br.com.motivafit.dto.response;

import br.com.motivafit.enums.Modalidade;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Exercício predefinido do catálogo")
public record CatalogoExercicioResponseDTO(
        @Schema(description = "Identificador do exercício", example = "1")
        Long id,
        @Schema(description = "Nome do exercício", example = "Supino reto")
        String nome,
        @Schema(description = "Modalidade do exercício", example = "MUSCULACAO")
        Modalidade modalidade,
        @Schema(description = "Grupo muscular trabalhado", example = "Peito")
        String grupoMuscular
) {
}