package br.com.motivafit.dto.response;

import br.com.motivafit.enums.TipoTreino;
import br.com.motivafit.enums.Visibilidade;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;

@Schema(description = "Treino cadastrado na plataforma, com o dono, para a administração")
public record AdminTreinoDTO(
        @Schema(description = "Identificador do treino", example = "12") Long id,
        @Schema(description = "Nome do treino", example = "Treino A") String nome,
        @Schema(description = "Tipo do treino") TipoTreino tipo,
        @Schema(description = "Visibilidade do treino") Visibilidade visibilidade,
        @Schema(description = "Identificador do dono", example = "42") Long usuarioId,
        @Schema(description = "E-mail do dono", example = "aluno@motivafit.com") String usuarioEmail,
        @Schema(description = "Identificador do treino público de origem, quando é uma cópia", nullable = true) Long treinoOrigemId,
        @Schema(description = "Data e hora de criação") OffsetDateTime createdAt
) {
}
