package br.com.motivafit.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;

@Schema(description = "Convite pendente recebido pelo usuário autenticado")
public record ConviteGrupoRecebidoDTO(
        @Schema(description = "Identificador do convite", example = "9") Long id,
        @Schema(description = "Identificador do grupo", example = "5") Long grupoId,
        @Schema(description = "Nome do grupo", example = "Corredores de Brasília") String grupoNome,
        @Schema(description = "E-mail de quem convidou", example = "admin@motivafit.com") String convidanteEmail,
        @Schema(description = "Token para aceitar o convite") String token,
        @Schema(description = "Data e hora de expiração") OffsetDateTime expiraEm
) {
}
