package br.com.motivafit.dto.response;

import br.com.motivafit.enums.Modalidade;

public record CatalogoExercicioResponseDTO(
        Long id,
        String nome,
        Modalidade modalidade,
        String grupoMuscular
) {
}