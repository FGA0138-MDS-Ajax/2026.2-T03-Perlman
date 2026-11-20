package br.com.motivafit.dto.response;

import java.time.OffsetDateTime;

public record GrupoFeedResponseDTO(
        Long id, Long usuarioId, String tipo, String conteudo, OffsetDateTime criadoEm
) {}
