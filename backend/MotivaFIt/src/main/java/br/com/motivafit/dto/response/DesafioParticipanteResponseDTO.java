package br.com.motivafit.dto.response;

import br.com.motivafit.enums.EstadoParticipante;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;

@Schema(description = "Informações de um participante em um desafio")
public record DesafioParticipanteResponseDTO(
        @Schema(description = "Identificador da conta", example = "42")
        Long usuarioId,
        @Schema(description = "E-mail da conta", example = "amigo@motivafit.com")
        String email,
        @Schema(description = "Estado da participação", example = "CONVIDADO")
        EstadoParticipante estado,
        @Schema(description = "Data em que aceitou o desafio", type = "string", format = "date-time", example = "2026-11-20T10:00:00Z")
        OffsetDateTime aceitoEm
) {
}
