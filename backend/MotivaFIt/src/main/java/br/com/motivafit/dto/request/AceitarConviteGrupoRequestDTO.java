package br.com.motivafit.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Dados para aceitar um convite de grupo")
public record AceitarConviteGrupoRequestDTO(
        @NotBlank(message = "O token do convite é obrigatório")
        @Schema(description = "Token recebido no convite", example = "e1c2f3...")
        String token
) {}
