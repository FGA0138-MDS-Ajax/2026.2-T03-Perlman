package br.com.motivafit.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import io.swagger.v3.oas.annotations.media.Schema;

public record LoginRequestDTO(
        @NotBlank(message = "email é obrigatório")
        @Email(message = "Insira um email válido")
        @Schema(description = "E-mail usado para acessar a conta", example = "usuario@motivafit.com")
        String email,

        @NotBlank(message = "Senha é obrigatória")
        @Schema(description = "Senha enviada somente para autenticação via HTTPS", example = "SenhaSegura123!")
        String senha
) {
}
