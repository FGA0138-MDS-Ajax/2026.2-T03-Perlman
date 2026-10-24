package br.com.motivafit.dto.request;

import br.com.motivafit.enums.Modalidade;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para cadastrar ou alterar um exercício do catálogo")
public record CatalogoExercicioRequestDTO(
        @NotBlank(message = "O nome do exercício é obrigatório")
        @Size(max = 100, message = "O nome do exercício deve ter no máximo 100 caracteres")
        @Schema(description = "Nome único do exercício (máximo de 100 caracteres)", example = "Remada cavalinho")
        String nome,

        @NotNull(message = "A modalidade é obrigatória")
        @Schema(description = "Modalidade do exercício", example = "MUSCULACAO")
        Modalidade modalidade,

        @NotBlank(message = "O grupo muscular é obrigatório")
        @Size(max = 50, message = "O grupo muscular deve ter no máximo 50 caracteres")
        @Schema(description = "Grupo muscular trabalhado (máximo de 50 caracteres)", example = "Costas")
        String grupoMuscular
) {
}