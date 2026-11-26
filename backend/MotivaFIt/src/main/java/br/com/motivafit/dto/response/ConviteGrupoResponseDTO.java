package br.com.motivafit.dto.response;

import java.time.OffsetDateTime;

public record ConviteGrupoResponseDTO(
        Long id, Long grupoId, Long convidadoId, String token, OffsetDateTime expiraEm
) {}
