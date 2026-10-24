package br.com.motivafit.dto.request;

import br.com.motivafit.enums.TipoTreino;
import br.com.motivafit.enums.Visibilidade;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para cadastrar ou alterar um treino")
public record TreinoRequestDTO(
        @NotBlank(message = "O nome do treino é obrigatório")
        @Size(max = 150, message = "O nome do treino deve ter no máximo 150 caracteres")
        @Schema(description = "Nome do treino (máximo de 150 caracteres)", example = "Treino A - Peito e Tríceps")
        String nome,

        @NotNull(message = "O tipo do treino é obrigatório")
        @Schema(description = "Tipo do treino", example = "MUSCULACAO")
        TipoTreino tipo,

        @Schema(description = "Visibilidade do treino. Se omitida, o treino é cadastrado como PRIVADO.", example = "PRIVADO")
        Visibilidade visibilidade
) {
}
