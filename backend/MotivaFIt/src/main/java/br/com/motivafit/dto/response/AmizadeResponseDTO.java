package br.com.motivafit.dto.response;

import br.com.motivafit.enums.EstadoAmizade;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;

@Schema(description = "Informações de uma amizade")
public record AmizadeResponseDTO(
        @Schema(description = "Identificador da amizade", example = "1")
        Long id,
        @Schema(description = "Identificador do solicitante", example = "7")
        Long solicitanteId,
        @Schema(description = "E-mail do solicitante", example = "solicitante@motivafit.com")
        String solicitanteEmail,
        @Schema(description = "Identificador do destinatário", example = "15")
        Long destinatarioId,
        @Schema(description = "E-mail do destinatário", example = "destinatario@motivafit.com")
        String destinatarioEmail,
        @Schema(description = "Estado da amizade", example = "PENDENTE")
        EstadoAmizade estado,
        @Schema(description = "Data de criação", type = "string", format = "date-time", example = "2026-11-20T10:00:00Z")
        OffsetDateTime criadoEm,
        @Schema(description = "Data de atualização", type = "string", format = "date-time", example = "2026-11-20T11:00:00Z")
        OffsetDateTime atualizadoEm
) {
}
