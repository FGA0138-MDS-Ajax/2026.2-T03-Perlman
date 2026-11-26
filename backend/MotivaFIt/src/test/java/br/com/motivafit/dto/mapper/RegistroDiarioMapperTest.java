package br.com.motivafit.dto.mapper;

import br.com.motivafit.dto.request.RegistroDiarioRequestDTO;
import br.com.motivafit.dto.response.RegistroDiarioResponseDTO;
import br.com.motivafit.entity.RegistroDiario;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Constructor;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

import static org.junit.jupiter.api.Assertions.*;

class RegistroDiarioMapperTest {

    @Test
    void convertePedidoEmEntidadeComODonoDoToken() {
        OffsetDateTime executado = OffsetDateTime.now().minusHours(2);
        var request = new RegistroDiarioRequestDTO(1L, 10L, 30L, new BigDecimal("80.5"), 8, 3, 1200,
                new BigDecimal("100"), executado, "chave-1");

        RegistroDiario registro = RegistroDiarioMapper.toEntity(request, 7L);

        assertNull(registro.getId());
        assertEquals(7L, registro.getUsuarioId());
        assertEquals(1L, registro.getCatalogoId());
        assertEquals(10L, registro.getTreinoId());
        assertEquals(30L, registro.getExercicioId());
        assertEquals(new BigDecimal("80.5"), registro.getCargaKg());
        assertEquals(8, registro.getRepeticoes());
        assertEquals(3, registro.getSeries());
        assertEquals(1200, registro.getTempoS());
        assertEquals(new BigDecimal("100"), registro.getDistanciaM());
        assertSame(executado, registro.getExecutadoEm());
        assertNull(registro.getExercicioNome());
        assertNull(registro.getTreinoNome());
        assertNull(registro.getChaveIdempotencia());
    }

    @Test
    void dataOmitidaViraOMomentoAtual() {
        var request = new RegistroDiarioRequestDTO(1L, null, null, null, null, null, 600, null, null, null);
        OffsetDateTime antes = OffsetDateTime.now().minusSeconds(1);

        RegistroDiario registro = RegistroDiarioMapper.toEntity(request, 7L);

        assertTrue(registro.getExecutadoEm().isAfter(antes));
        assertNull(registro.getTreinoId());
        assertNull(registro.getExercicioId());
    }

    @Test
    void converteEntidadeEmResposta() {
        RegistroDiario registro = new RegistroDiario();
        OffsetDateTime executado = OffsetDateTime.now();
        ReflectionTestUtils.setField(registro, "id", 101L);
        registro.setUsuarioId(7L);
        registro.setCatalogoId(1L);
        registro.setTreinoId(10L);
        registro.setExercicioId(30L);
        registro.setTreinoNome("Treino A");
        registro.setExercicioNome("Supino reto");
        registro.setCargaKg(new BigDecimal("80.5"));
        registro.setRepeticoes(8);
        registro.setSeries(3);
        registro.setTempoS(1200);
        registro.setDistanciaM(new BigDecimal("100"));
        registro.setExecutadoEm(executado);

        RegistroDiarioResponseDTO dto = RegistroDiarioMapper.toDto(registro);

        assertEquals(101L, dto.id());
        assertEquals(1L, dto.catalogoId());
        assertEquals(10L, dto.treinoId());
        assertEquals(30L, dto.exercicioId());
        assertEquals("Treino A", dto.treinoNome());
        assertEquals("Supino reto", dto.exercicioNome());
        assertEquals(new BigDecimal("80.5"), dto.cargaKg());
        assertEquals(8, dto.repeticoes());
        assertEquals(3, dto.series());
        assertEquals(1200, dto.tempoS());
        assertEquals(new BigDecimal("100"), dto.distanciaM());
        assertSame(executado, dto.executadoEm());
    }

    @Test
    void construtorPrivadoImpedeInstanciacaoDireta() throws Exception {
        Constructor<RegistroDiarioMapper> constructor = RegistroDiarioMapper.class.getDeclaredConstructor();
        constructor.setAccessible(true);

        assertNotNull(constructor.newInstance());
    }
}