package br.com.motivafit.dto.mapper;

import br.com.motivafit.dto.request.ExercicioRequestDTO;
import br.com.motivafit.entity.CatalogoExercicio;
import br.com.motivafit.entity.Exercicio;
import br.com.motivafit.entity.Treino;
import br.com.motivafit.enums.Modalidade;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class ExercicioMapperTest {
    private final ExercicioMapper mapper = new ExercicioMapper();

    @Test
    void converteEntidadeComRelacionamentosEmResponse() {
        Treino treino = new Treino();
        ReflectionTestUtils.setField(treino, "id", 3L);
        CatalogoExercicio catalogo = catalogo(8L);
        Exercicio exercicio = new Exercicio();
        exercicio.setId(12L);
        exercicio.setMeta("3 séries de 12");
        exercicio.setMetaRecorde("60 kg");
        exercicio.setTreino(treino);
        exercicio.setCatalogoExercicio(catalogo);

        var dto = mapper.toDto(exercicio);

        assertEquals(12L, dto.id());
        assertEquals("3 séries de 12", dto.meta());
        assertEquals("60 kg", dto.metaRecorde());
        assertEquals(3L, dto.treinoId());
        assertEquals(8L, dto.catalogoExercicioId());
    }

    @Test
    void converteEntidadeSemRelacionamentosComIdsNulos() {
        Exercicio exercicio = new Exercicio();
        exercicio.setMeta("Uma meta");

        var dto = mapper.toDto(exercicio);

        assertNull(dto.treinoId());
        assertNull(dto.catalogoExercicioId());
    }

    @Test
    void entradasNulasRetornamNulo() {
        assertNull(mapper.toDto(null));
        assertNull(mapper.toEntity(null, new Treino(), catalogo(1L)));
    }

    @Test
    void converteRequestEmEntidadeAssociadaAoTreinoEcatalogo() {
        Treino treino = new Treino();
        CatalogoExercicio catalogo = catalogo(5L);
        var request = new ExercicioRequestDTO("3 séries", "80 kg", 2L, 5L);

        Exercicio entity = mapper.toEntity(request, treino, catalogo);

        assertEquals("3 séries", entity.getMeta());
        assertEquals("80 kg", entity.getMetaRecorde());
        assertSame(treino, entity.getTreino());
        assertSame(catalogo, entity.getCatalogoExercicio());
    }

    private CatalogoExercicio catalogo(Long id) {
        CatalogoExercicio catalogo = new CatalogoExercicio("Supino", Modalidade.MUSCULACAO, "Peito");
        ReflectionTestUtils.setField(catalogo, "id", id);
        return catalogo;
    }
}
