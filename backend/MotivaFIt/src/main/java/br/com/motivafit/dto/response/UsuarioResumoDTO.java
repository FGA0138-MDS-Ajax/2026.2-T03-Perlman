package br.com.motivafit.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Identificação mínima de outra conta, usada para convites e amizades")
public record UsuarioResumoDTO(
        @Schema(description = "Identificador da conta", example = "15")
        Long id,
        @Schema(description = "E-mail da conta", example = "amigo@motivafit.com")
        String email
) {
}
