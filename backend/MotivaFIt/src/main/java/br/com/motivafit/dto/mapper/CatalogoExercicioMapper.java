package br.com.motivafit.dto.mapper;

import br.com.motivafit.dto.request.CatalogoExercicioRequestDTO;
import br.com.motivafit.dto.response.CatalogoExercicioResponseDTO;
import br.com.motivafit.entity.CatalogoExercicio;

public final class CatalogoExercicioMapper {

    private CatalogoExercicioMapper() {
    }

    public static CatalogoExercicioResponseDTO toDto(CatalogoExercicio exercicio) {
        return new CatalogoExercicioResponseDTO(
                exercicio.getId(),
                exercicio.getNome(),
                exercicio.getModalidade(),
                exercicio.getGrupoMuscular()
        );
    }

    public static CatalogoExercicio toEntity(CatalogoExercicioRequestDTO dto) {
        return new CatalogoExercicio(
                dto.nome().trim(),
                dto.modalidade(),
                dto.grupoMuscular().trim()
        );
    }

    public static void updateEntity(CatalogoExercicio entity, CatalogoExercicioRequestDTO dto) {
        entity.atualizar(
                dto.nome().trim(),
                dto.modalidade(),
                dto.grupoMuscular().trim()
        );
    }
}