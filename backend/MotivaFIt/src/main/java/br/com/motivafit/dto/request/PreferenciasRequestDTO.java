package br.com.motivafit.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Preferências de interface da conta")
public record PreferenciasRequestDTO(
        @NotBlank(message = "O tema é obrigatório")
        @Pattern(regexp = "light|dark|system", message = "O tema deve ser light, dark ou system")
        @Schema(description = "Tema da interface", allowableValues = {"light", "dark", "system"}, example = "dark")
        String tema
) {
}
