package br.com.motivafit.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import io.swagger.v3.oas.annotations.media.Schema;

public record UsuarioRequestDTO(
        @NotBlank(message = "Email é obrigatório")
        @Email(message = "Insira um email válido")
        @Schema(description = "E-mail único da conta", example = "usuario@motivafit.com")
        String email,

        @NotBlank(message = "Senha é obrigatória")
        @Schema(description = "Mínimo de 12 caracteres, incluindo maiúscula, minúscula, número e símbolo. Espaços internos são permitidos.", example = "SenhaSegura123!")
        @Pattern(
                regexp = "^(?=.*\\p{Lu})(?=.*\\p{Ll})(?=.*\\d)(?=.*[^\\p{L}\\d\\s]).{12,}$",
                message = "A senha deve ter pelo menos 12 caracteres e incluir letra maiúscula, letra minúscula, número e símbolo"
        )
        String senha
) {
}
