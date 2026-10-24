package br.com.motivafit.dto.request;

import br.com.motivafit.enums.TipoTreino;
import br.com.motivafit.enums.Visibilidade;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TreinoRequestDTO(
        @NotBlank(message = "O nome do treino é obrigatório")
        @Size(max = 150, message = "O nome do treino deve ter no máximo 150 caracteres")
        String nome,

        @NotNull(message = "O tipo do treino é obrigatório")
        TipoTreino tipo,

        Visibilidade visibilidade
) {
}
