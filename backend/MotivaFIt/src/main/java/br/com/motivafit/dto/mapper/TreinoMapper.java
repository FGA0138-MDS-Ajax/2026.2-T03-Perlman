package br.com.motivafit.dto.mapper;

import br.com.motivafit.dto.request.TreinoRequestDTO;
import br.com.motivafit.dto.response.TreinoResponseDTO;
import br.com.motivafit.entity.Treino;
import br.com.motivafit.enums.Visibilidade;

public final class TreinoMapper {

    private TreinoMapper() {
    }

    public static TreinoResponseDTO toDto(Treino treino) {
        return new TreinoResponseDTO(
                treino.getId(),
                treino.getNome(),
                treino.getTipo(),
                treino.getVisibilidade(),
                treino.getCreatedAt(),
                treino.getUpdatedAt()
        );
    }

    public static Treino toEntity(TreinoRequestDTO dto, Long usuarioId) {
        Treino entity = new Treino();
        entity.setUsuarioId(usuarioId);
        entity.setNome(dto.nome().trim());
        entity.setTipo(dto.tipo());
        entity.setVisibilidade(
                dto.visibilidade() != null ? dto.visibilidade() : Visibilidade.PRIVADO
        );
        return entity;
    }

    public static void updateEntity(Treino entity, TreinoRequestDTO dto) {
        entity.setNome(dto.nome().trim());
        entity.setTipo(dto.tipo());
        if (dto.visibilidade() != null) {
            entity.setVisibilidade(dto.visibilidade());
        }
    }
}