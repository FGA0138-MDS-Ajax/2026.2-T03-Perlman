package br.com.motivafit.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Solicitação de amizade")
public record AmizadeRequestDTO(
        @Schema(description = "Identificador do usuário destinatário", example = "15")
        @NotNull(message = "O identificador do destinatário é obrigatório")
        Long destinatarioId
) {
}
