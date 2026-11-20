package br.com.motivafit.dto.response;

import br.com.motivafit.enums.PapelGrupo;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;

@Schema(description = "Dados públicos de um grupo")
public record GrupoResponseDTO(
        Long id, String nome, String descricao, Long criadorId,
        PapelGrupo papel, OffsetDateTime criadoEm, OffsetDateTime atualizadoEm
) {}
