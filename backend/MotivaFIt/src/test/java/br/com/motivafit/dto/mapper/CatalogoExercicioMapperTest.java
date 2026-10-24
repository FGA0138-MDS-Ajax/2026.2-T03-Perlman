package br.com.motivafit.dto;

import br.com.motivafit.dto.mapper.CatalogoExercicioMapper;
import br.com.motivafit.dto.request.CatalogoExercicioRequestDTO;
import br.com.motivafit.dto.response.CatalogoExercicioResponseDTO;
import br.com.motivafit.entity.CatalogoExercicio;
import br.com.motivafit.enums.Modalidade;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Constructor;

import static org.junit.jupiter.api.Assertions.*;

class CatalogoExercicioMapperTest {

    @Test
    void converteEntidadeEmResposta() {
        CatalogoExercicio entity = new CatalogoExercicio("Supino reto", Modalidade.MUSCULACAO, "Peito");
        ReflectionTestUtils.setField(entity, "id", 3L);

        CatalogoExercicioResponseDTO dto = CatalogoExercicioMapper.toDto(entity);

        assertEquals(3L, dto.id());
        assertEquals("Supino reto", dto.nome());
        assertEquals(Modalidade.MUSCULACAO, dto.modalidade());
        assertEquals("Peito", dto.grupoMuscular());
    }

    @Test
    void convertePedidoEmEntidadeAtivaSemEspacosNasPontas() {
        var request = new CatalogoExercicioRequestDTO("  Remada cavalinho ", Modalidade.MUSCULACAO, " Costas  ");

        CatalogoExercicio entity = CatalogoExercicioMapper.toEntity(request);

        assertNull(entity.getId());
        assertEquals("Remada cavalinho", entity.getNome());
        assertEquals(Modalidade.MUSCULACAO, entity.getModalidade());
        assertEquals("Costas", entity.getGrupoMuscular());
        assertTrue(entity.getAtivo());
    }

    @Test
    void atualizaEntidadeExistenteSemMudarOStatus() {
        CatalogoExercicio entity = new CatalogoExercicio("Corrida", Modalidade.AEROBICO, "Cardio");
        entity.desativar();

        CatalogoExercicioMapper.updateEntity(entity,
                new CatalogoExercicioRequestDTO("  Stiff ", Modalidade.MUSCULACAO, " Posterior de coxa "));

        assertEquals("Stiff", entity.getNome());
        assertEquals(Modalidade.MUSCULACAO, entity.getModalidade());
        assertEquals("Posterior de coxa", entity.getGrupoMuscular());
        assertFalse(entity.getAtivo());
    }

    @Test
    void construtorPrivadoImpedeInstanciacaoDireta() throws Exception {
        Constructor<CatalogoExercicioMapper> constructor = CatalogoExercicioMapper.class.getDeclaredConstructor();
        constructor.setAccessible(true);

        assertNotNull(constructor.newInstance());
    }
}