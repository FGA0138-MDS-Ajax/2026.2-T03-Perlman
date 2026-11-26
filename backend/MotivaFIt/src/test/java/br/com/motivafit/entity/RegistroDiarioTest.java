package br.com.motivafit.entity;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import static org.junit.jupiter.api.Assertions.*;

class RegistroDiarioTest {

    @Test
    void registroNovoNaoTemNenhumValor() {
        RegistroDiario registro = new RegistroDiario();

        assertNull(registro.getId());
        assertNull(registro.getUsuarioId());
        assertNull(registro.getCatalogoId());
        assertNull(registro.getTreinoId());
        assertNull(registro.getExercicioId());
        assertNull(registro.getTreinoNome());
        assertNull(registro.getExercicioNome());
        assertNull(registro.getCargaKg());
        assertNull(registro.getRepeticoes());
        assertNull(registro.getSeries());
        assertNull(registro.getTempoS());
        assertNull(registro.getDistanciaM());
        assertNull(registro.getExecutadoEm());
        assertNull(registro.getChaveIdempotencia());
        assertNull(registro.getCreatedAt());
    }

    @Test
    void gettersESettersGuardamOsValores() {
        RegistroDiario registro = new RegistroDiario();
        OffsetDateTime agora = OffsetDateTime.now();

        registro.setUsuarioId(7L);
        registro.setCatalogoId(1L);
        registro.setTreinoId(10L);
        registro.setExercicioId(30L);
        registro.setTreinoNome("Treino A");
        registro.setExercicioNome("Supino reto");
        registro.setCargaKg(new BigDecimal("80.50"));
        registro.setRepeticoes(8);
        registro.setSeries(3);
        registro.setTempoS(1200);
        registro.setDistanciaM(new BigDecimal("5000.00"));
        registro.setExecutadoEm(agora);
        registro.setChaveIdempotencia("chave-1");
        ReflectionTestUtils.setField(registro, "id", 101L);
        ReflectionTestUtils.setField(registro, "createdAt", agora);

        assertEquals(101L, registro.getId());
        assertEquals(7L, registro.getUsuarioId());
        assertEquals(1L, registro.getCatalogoId());
        assertEquals(10L, registro.getTreinoId());
        assertEquals(30L, registro.getExercicioId());
        assertEquals("Treino A", registro.getTreinoNome());
        assertEquals("Supino reto", registro.getExercicioNome());
        assertEquals(new BigDecimal("80.50"), registro.getCargaKg());
        assertEquals(8, registro.getRepeticoes());
        assertEquals(3, registro.getSeries());
        assertEquals(1200, registro.getTempoS());
        assertEquals(new BigDecimal("5000.00"), registro.getDistanciaM());
        assertSame(agora, registro.getExecutadoEm());
        assertEquals("chave-1", registro.getChaveIdempotencia());
        assertSame(agora, registro.getCreatedAt());
    }
}