package br.com.motivafit.dto.mapper;

import br.com.motivafit.dto.request.ExercicioRequestDTO;
import br.com.motivafit.dto.response.ExercicioResponseDTO;
import br.com.motivafit.entity.CatalogoExercicio;
import br.com.motivafit.entity.Exercicio;
import br.com.motivafit.entity.Treino;
import org.springframework.stereotype.Component;

@Component
public class ExercicioMapper {

    public ExercicioResponseDTO toDto(Exercicio exercicio) {
        if (exercicio == null) {
            return null;
        }

        Long treinoId = exercicio.getTreino() != null ? exercicio.getTreino().getId() : null;
        Long catalogoExercicioId = exercicio.getCatalogoExercicio() != null ? exercicio.getCatalogoExercicio().getId() : null;

        return new ExercicioResponseDTO(
                exercicio.getId(),
                exercicio.getMeta(),
                exercicio.getMetaRecorde(),
                treinoId,
                catalogoExercicioId
        );
    }

    public Exercicio toEntity(ExercicioRequestDTO dto, Treino treino, CatalogoExercicio catalogoExercicio) {
        if (dto == null) {
            return null;
        }

        Exercicio exercicio = new Exercicio();
        exercicio.setMeta(dto.meta());
        exercicio.setMetaRecorde(dto.metaRecorde());
        exercicio.setTreino(treino);
        exercicio.setCatalogoExercicio(catalogoExercicio);

        return exercicio;
    }
}