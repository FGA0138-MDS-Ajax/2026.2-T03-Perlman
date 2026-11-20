package br.com.motivafit.dto.request;

import br.com.motivafit.enums.EstadoAmizade;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Atualização de estado de amizade")
public record AmizadeUpdateRequestDTO(
        @Schema(description = "Novo estado da amizade (ACEITA ou RECUSADA)", example = "ACEITA")
        @NotNull(message = "O estado é obrigatório")
        EstadoAmizade estado
) {
}
