package br.com.motivafit.dto.response;

import br.com.motivafit.enums.PapelGrupo;
import java.time.OffsetDateTime;

public record GrupoMembroResponseDTO(
        Long usuarioId, String email, PapelGrupo papel, OffsetDateTime entradaEm
) {}
