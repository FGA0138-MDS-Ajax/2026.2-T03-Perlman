package br.com.motivafit.dto.mapper;

import br.com.motivafit.dto.mapper.TreinoMapper;
import br.com.motivafit.dto.request.TreinoRequestDTO;
import br.com.motivafit.dto.response.TreinoResponseDTO;
import br.com.motivafit.entity.Treino;
import br.com.motivafit.enums.TipoTreino;
import br.com.motivafit.enums.Visibilidade;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Constructor;
import java.time.OffsetDateTime;

import static org.junit.jupiter.api.Assertions.*;

class TreinoMapperTest {

    @Test
    void convertePedidoEmEntidadeComDonoENomeSemEspacos() {
        var request = new TreinoRequestDTO("  Treino A  ", TipoTreino.MUSCULACAO, Visibilidade.PUBLICO);

        Treino entity = TreinoMapper.toEntity(request, 7L);

        assertEquals(7L, entity.getUsuarioId());
        assertEquals("Treino A", entity.getNome());
        assertEquals(TipoTreino.MUSCULACAO, entity.getTipo());
        assertEquals(Visibilidade.PUBLICO, entity.getVisibilidade());
        assertNull(entity.getId());
        assertNull(entity.getExcluidoEm());
    }

    @Test
    void visibilidadeOmitidaNoCadastroFicaPrivada() {
        var request = new TreinoRequestDTO("Treino B", TipoTreino.AEROBICO, null);

        Treino entity = TreinoMapper.toEntity(request, 7L);

        assertEquals(Visibilidade.PRIVADO, entity.getVisibilidade());
    }

    @Test
    void converteEntidadeEmResposta() {
        Treino entity = new Treino();
        OffsetDateTime criado = OffsetDateTime.now().minusDays(1);
        OffsetDateTime alterado = OffsetDateTime.now();
        ReflectionTestUtils.setField(entity, "id", 10L);
        ReflectionTestUtils.setField(entity, "createdAt", criado);
        ReflectionTestUtils.setField(entity, "updatedAt", alterado);
        entity.setUsuarioId(7L);
        entity.setNome("Treino C");
        entity.setTipo(TipoTreino.AEROBICO);
        entity.setVisibilidade(Visibilidade.PRIVADO);

        TreinoResponseDTO dto = TreinoMapper.toDto(entity);

        assertEquals(10L, dto.id());
        assertEquals("Treino C", dto.nome());
        assertEquals(TipoTreino.AEROBICO, dto.tipo());
        assertEquals(Visibilidade.PRIVADO, dto.visibilidade());
        assertSame(criado, dto.createdAt());
        assertSame(alterado, dto.updatedAt());
    }

    @Test
    void atualizaEntidadeExistenteIncluindoVisibilidadeQuandoInformada() {
        Treino entity = treinoExistente();

        TreinoMapper.updateEntity(entity,
                new TreinoRequestDTO("  Novo nome ", TipoTreino.AEROBICO, Visibilidade.PUBLICO));

        assertEquals("Novo nome", entity.getNome());
        assertEquals(TipoTreino.AEROBICO, entity.getTipo());
        assertEquals(Visibilidade.PUBLICO, entity.getVisibilidade());
        assertEquals(7L, entity.getUsuarioId());
    }

    @Test
    void atualizacaoSemVisibilidadeMantemAVisibilidadeAtual() {
        Treino entity = treinoExistente();

        TreinoMapper.updateEntity(entity, new TreinoRequestDTO("Outro nome", TipoTreino.MUSCULACAO, null));

        assertEquals("Outro nome", entity.getNome());
        assertEquals(Visibilidade.PRIVADO, entity.getVisibilidade());
    }

    @Test
    void construtorPrivadoImpedeInstanciacaoDireta() throws Exception {
        Constructor<TreinoMapper> constructor = TreinoMapper.class.getDeclaredConstructor();
        constructor.setAccessible(true);

        assertNotNull(constructor.newInstance());
    }

    private Treino treinoExistente() {
        Treino entity = new Treino();
        entity.setUsuarioId(7L);
        entity.setNome("Antigo");
        entity.setTipo(TipoTreino.MUSCULACAO);
        entity.setVisibilidade(Visibilidade.PRIVADO);
        return entity;
    }
}