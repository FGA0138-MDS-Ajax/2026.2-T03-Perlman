package br.com.motivafit.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Convite de participante para desafio")
public record AdicionarParticipanteRequestDTO(
        @Schema(description = "Identificador do usuário a convidar", example = "15")
        @NotNull(message = "O identificador do usuário é obrigatório")
        Long usuarioId
) {
}
