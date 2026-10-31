package br.com.motivafit.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ConviteAdminRequestDTO(
        @NotNull(message = "O ID do convidador é obrigatório")
        @Positive(message = "O ID do convidador deve ser positivo")
        Long convidadorId,

        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "Insira um e-mail válido")
        @Size(max = 254, message = "O e-mail deve ter no máximo 254 caracteres")
        String email
) {
}
