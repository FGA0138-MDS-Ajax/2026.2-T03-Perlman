package br.com.motivafit.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Schema(description = "Dados para convidar um usuário para um grupo")
public record ConviteGrupoRequestDTO(
        @NotNull(message = "O identificador do usuário é obrigatório")
        @Positive(message = "O identificador do usuário deve ser positivo")
        @Schema(description = "Identificador do usuário convidado", example = "15")
        Long usuarioId
) {}
