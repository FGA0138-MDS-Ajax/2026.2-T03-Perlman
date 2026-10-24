package br.com.motivafit.dto.request;

import br.com.motivafit.enums.Modalidade;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CatalogoExercicioRequestDTO(
        @NotBlank(message = "O nome do exercício é obrigatório")
        @Size(max = 100, message = "O nome do exercício deve ter no máximo 100 caracteres")
        String nome,

        @NotNull(message = "A modalidade é obrigatória")
        Modalidade modalidade,

        @NotBlank(message = "O grupo muscular é obrigatório")
        @Size(max = 50, message = "O grupo muscular deve ter no máximo 50 caracteres")
        String grupoMuscular
) {
}