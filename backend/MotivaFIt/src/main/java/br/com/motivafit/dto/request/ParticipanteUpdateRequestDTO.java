package br.com.motivafit.dto.request;

import br.com.motivafit.enums.EstadoParticipante;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Atualização de participação em desafio")
public record ParticipanteUpdateRequestDTO(
        @Schema(description = "Novo estado da participação", example = "ACEITO")
        @NotNull(message = "O estado é obrigatório")
        EstadoParticipante estado
) {
}
