package br.com.motivafit.entity;

import br.com.motivafit.enums.Modalidade;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Constructor;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CatalogoExercicioTest {

    @Test
    void exercicioNovoNasceAtivoESemId() {
        CatalogoExercicio exercicio = new CatalogoExercicio("Supino reto", Modalidade.MUSCULACAO, "Peito");

        assertNull(exercicio.getId());
        assertEquals("Supino reto", exercicio.getNome());
        assertEquals(Modalidade.MUSCULACAO, exercicio.getModalidade());
        assertEquals("Peito", exercicio.getGrupoMuscular());
        assertTrue(exercicio.getAtivo());
    }

    @Test
    void atualizarAlteraNomeModalidadeEGrupoMuscularSemMexerNoStatus() {
        CatalogoExercicio exercicio = new CatalogoExercicio("Corrida", Modalidade.AEROBICO, "Cardio");

        exercicio.atualizar("Remada baixa", Modalidade.MUSCULACAO, "Costas");

        assertEquals("Remada baixa", exercicio.getNome());
        assertEquals(Modalidade.MUSCULACAO, exercicio.getModalidade());
        assertEquals("Costas", exercicio.getGrupoMuscular());
        assertTrue(exercicio.getAtivo());
    }

    @Test
    void desativarMarcaOExercicioComoInativoEPodeSerRepetido() {
        CatalogoExercicio exercicio = new CatalogoExercicio("Prancha", Modalidade.MUSCULACAO, "Abdômen");

        exercicio.desativar();
        exercicio.desativar();

        assertFalse(exercicio.getAtivo());
    }

    @Test
    void construtorProtegidoUsadoPeloHibernateCriaExercicioAtivo() throws Exception {
        Constructor<CatalogoExercicio> constructor = CatalogoExercicio.class.getDeclaredConstructor();
        constructor.setAccessible(true);

        CatalogoExercicio exercicio = constructor.newInstance();

        assertNull(exercicio.getId());
        assertNull(exercicio.getNome());
        assertTrue(exercicio.getAtivo());
    }

    @Test
    void modalidadeTemExatamenteOsValoresPermitidosPelaMigration() {
        // Devem bater com o CHECK da tabela catalogo_exercicio (V4).
        assertEquals(List.of("MUSCULACAO", "AEROBICO"),
                List.of(Modalidade.values()).stream().map(Enum::name).toList());
    }
}