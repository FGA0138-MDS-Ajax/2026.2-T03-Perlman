package br.com.motivafit.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(
        @NotBlank(message = "Email é obrigatório")
        @Email(message = "Insira um email válido")
        String email,

        @NotBlank(message = "Senha é obrigatória")
        String senha
) {
}
