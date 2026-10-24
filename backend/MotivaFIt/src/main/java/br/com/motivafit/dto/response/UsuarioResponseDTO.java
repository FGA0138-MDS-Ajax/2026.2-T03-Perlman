package br.com.motivafit.dto.response;

import br.com.motivafit.enums.Perfil;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados públicos básicos de uma conta")
public record UsuarioResponseDTO(
        @Schema(description = "Identificador da conta", example = "42")
        Long id,
        @Schema(description = "E-mail da conta", example = "usuario@motivafit.com")
        String email,
        @Schema(description = "Perfil de acesso atribuído à conta", example = "USUARIO")
        Perfil perfil,
        @Schema(description = "Indica se a conta está ativa", example = "true")
        Boolean ativo
) {
}
