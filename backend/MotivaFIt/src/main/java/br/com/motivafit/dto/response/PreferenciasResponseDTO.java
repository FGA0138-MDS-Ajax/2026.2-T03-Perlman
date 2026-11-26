package br.com.motivafit.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Preferências de interface da conta")
public record PreferenciasResponseDTO(
        @Schema(description = "Tema da interface", allowableValues = {"light", "dark", "system"}, example = "dark")
        String tema
) {
}
