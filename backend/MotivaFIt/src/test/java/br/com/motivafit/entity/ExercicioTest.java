package br.com.motivafit.entity;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ExercicioTest {
    @Test
    void gettersESettersPreservamDadosEAssociacoes() {
        Exercicio exercicio = new Exercicio();
        Treino treino = new Treino();
        CatalogoExercicio catalogo = new CatalogoExercicio(
                "Agachamento", br.com.motivafit.enums.Modalidade.MUSCULACAO, "Pernas");

        exercicio.setId(5L);
        exercicio.setTreinoId(3L);
        exercicio.setMeta("4 séries de 8 repetições");
        exercicio.setMetaRecorde("100 kg");
        exercicio.setTreino(treino);
        exercicio.setCatalogoExercicio(catalogo);

        assertEquals(5L, exercicio.getId());
        assertEquals(3L, exercicio.getTreinoId());
        assertEquals("4 séries de 8 repetições", exercicio.getMeta());
        assertEquals("100 kg", exercicio.getMetaRecorde());
        assertSame(treino, exercicio.getTreino());
        assertSame(catalogo, exercicio.getCatalogoExercicio());
    }

    @Test
    void igualdadeEHashCodeUsamIdentificador() {
        Exercicio primeiro = new Exercicio();
        primeiro.setId(5L);
        Exercicio mesmoId = new Exercicio();
        mesmoId.setId(5L);
        Exercicio outroId = new Exercicio();
        outroId.setId(8L);

        assertEquals(primeiro, mesmoId);
        assertEquals(primeiro.hashCode(), mesmoId.hashCode());
        assertNotEquals(primeiro, outroId);
        assertNotEquals(primeiro, null);
        assertNotEquals(primeiro, new Object());
    }
}
