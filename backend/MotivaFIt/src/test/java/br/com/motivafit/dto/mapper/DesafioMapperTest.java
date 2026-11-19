package br.com.motivafit.dto.mapper;

import br.com.motivafit.dto.request.DesafioItemRequestDTO;
import br.com.motivafit.dto.response.DesafioResponseDTO;
import br.com.motivafit.entity.CatalogoExercicio;
import br.com.motivafit.entity.Desafio;
import br.com.motivafit.entity.DesafioItem;
import br.com.motivafit.enums.EstadoDesafio;
import br.com.motivafit.enums.Modalidade;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Constructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class DesafioMapperTest {
    private static final LocalDate PRAZO = LocalDate.of(2026, 12, 15);

    @Test
    void converteDesafioEItensEmRespostaComNomeEModalidadeDoCatalogo() {
        Desafio desafio = desafio(100L, 7L);
        DesafioItem item = item(5L, 100L, 1L);
        item.setMetaCargaKg(new BigDecimal("80"));
        item.setMetaSeries(3);
        item.setMetaTempoS(1800);
        item.setMetaDistanciaM(new BigDecimal("5000"));
        CatalogoExercicio supino = catalogo(1L, "Supino reto", Modalidade.MUSCULACAO);

        DesafioResponseDTO dto = DesafioMapper.toResponse(desafio, List.of(item), Map.of(1L, supino), 7L);

        assertEquals(100L, dto.id());
        assertEquals("Desafio das 100 repetições", dto.titulo());
        assertEquals(PRAZO, dto.prazo());
        assertEquals(EstadoDesafio.ATIVO, dto.estado());
        assertTrue(dto.souCriador());
        assertEquals(1, dto.itens().size());
        var itemDto = dto.itens().get(0);
        assertEquals(5L, itemDto.id());
        assertEquals(1L, itemDto.catalogoId());
        assertEquals("Supino reto", itemDto.exercicioNome());
        assertEquals(Modalidade.MUSCULACAO, itemDto.modalidade());
        assertEquals(new BigDecimal("80"), itemDto.metaCargaKg());
        assertEquals(100, itemDto.metaRepeticoes());
        assertEquals(3, itemDto.metaSeries());
        assertEquals(1800, itemDto.metaTempoS());
        assertEquals(new BigDecimal("5000"), itemDto.metaDistanciaM());
    }

    @Test
    void souCriadorEFalsoParaQuemNaoCriouODesafioOuQuandoOCriadorFoiExcluido() {
        assertFalse(DesafioMapper.toResponse(desafio(100L, 99L), List.of(), Map.of(), 7L).souCriador());
        assertFalse(DesafioMapper.toResponse(desafio(100L, null), List.of(), Map.of(), 7L).souCriador());
    }

    @Test
    void itemSemCorrespondenteNoCatalogoGeraRespostaSemNomeNemModalidade() {
        DesafioResponseDTO dto = DesafioMapper.toResponse(
                desafio(100L, 7L), List.of(item(5L, 100L, 1L)), Map.of(), 7L);

        assertNull(dto.itens().get(0).exercicioNome());
        assertNull(dto.itens().get(0).modalidade());
        assertEquals(1L, dto.itens().get(0).catalogoId());
    }

    @Test
    void convertePedidoDeItemEmEntidadeLigadaAoDesafio() {
        var request = new DesafioItemRequestDTO(1L, new BigDecimal("80"), 100, 3, 1800, new BigDecimal("5000"));

        DesafioItem item = DesafioMapper.toItemEntity(100L, request);

        assertNull(item.getId());
        assertEquals(100L, item.getDesafioId());
        assertEquals(1L, item.getCatalogoId());
        assertEquals(new BigDecimal("80"), item.getMetaCargaKg());
        assertEquals(100, item.getMetaRepeticoes());
        assertEquals(3, item.getMetaSeries());
        assertEquals(1800, item.getMetaTempoS());
        assertEquals(new BigDecimal("5000"), item.getMetaDistanciaM());
    }

    @Test
    void construtorPrivadoImpedeInstanciacaoDireta() throws Exception {
        Constructor<DesafioMapper> constructor = DesafioMapper.class.getDeclaredConstructor();
        constructor.setAccessible(true);

        assertNotNull(constructor.newInstance());
    }

    private Desafio desafio(Long id, Long criadorId) {
        Desafio desafio = new Desafio(criadorId, "Desafio das 100 repetições", PRAZO);
        ReflectionTestUtils.setField(desafio, "id", id);
        return desafio;
    }

    private DesafioItem item(Long id, Long desafioId, Long catalogoId) {
        DesafioItem item = new DesafioItem();
        ReflectionTestUtils.setField(item, "id", id);
        item.setDesafioId(desafioId);
        item.setCatalogoId(catalogoId);
        item.setMetaRepeticoes(100);
        return item;
    }

    private CatalogoExercicio catalogo(Long id, String nome, Modalidade modalidade) {
        CatalogoExercicio catalogo = new CatalogoExercicio(nome, modalidade, "Peito");
        ReflectionTestUtils.setField(catalogo, "id", id);
        return catalogo;
    }
}