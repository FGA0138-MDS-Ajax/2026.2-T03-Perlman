package br.com.motivafit.dto.response;

import br.com.motivafit.enums.TipoTreino;
import br.com.motivafit.enums.Visibilidade;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;

@Schema(description = "Dados de um treino do usuário")
public record TreinoResponseDTO(
        @Schema(description = "Identificador do treino", example = "12")
        Long id,
        @Schema(description = "Nome do treino", example = "Treino A - Peito e Tríceps")
        String nome,
        @Schema(description = "Tipo do treino", example = "MUSCULACAO")
        TipoTreino tipo,
        @Schema(description = "Visibilidade do treino", example = "PRIVADO")
        Visibilidade visibilidade,
        @Schema(description = "Data e hora de criação", type = "string", format = "date-time")
        OffsetDateTime createdAt,
        @Schema(description = "Data e hora da última alteração", type = "string", format = "date-time")
        OffsetDateTime updatedAt
) {
}