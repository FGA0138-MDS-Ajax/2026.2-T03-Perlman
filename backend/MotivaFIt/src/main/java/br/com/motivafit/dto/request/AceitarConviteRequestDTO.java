package br.com.motivafit.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public record AceitarConviteRequestDTO(
        @NotNull(message = "O ID do usuário é obrigatório")
        @Positive(message = "O ID do usuário deve ser positivo")
        Long usuarioId,

        @NotBlank(message = "O token do convite é obrigatório")
        @Pattern(
                regexp = "^[A-Za-z0-9_-]{43}$",
                message = "O token do convite está em formato inválido"
        )
        String token
) {
}
