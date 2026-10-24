package br.com.motivafit.dto.response;

import br.com.motivafit.enums.TipoTreino;
import br.com.motivafit.enums.Visibilidade;

import java.time.OffsetDateTime;

public record TreinoResponseDTO(
        Long id,
        String nome,
        TipoTreino tipo,
        Visibilidade visibilidade,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
