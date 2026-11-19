package br.com.motivafit.entity;

import br.com.motivafit.enums.EstadoDesafio;
import br.com.motivafit.enums.EstadoParticipante;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Constructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class DesafioEntidadesTest {

    @Test
    void desafioNovoNasceAtivoComOsDadosInformados() {
        LocalDate prazo = LocalDate.of(2026, 12, 15);

        Desafio desafio = new Desafio(7L, "Desafio das 100 repetições", prazo);

        assertNull(desafio.getId());
        assertEquals(7L, desafio.getCriadorId());
        assertEquals("Desafio das 100 repetições", desafio.getTitulo());
        assertEquals(prazo, desafio.getPrazo());
        assertEquals(EstadoDesafio.ATIVO, desafio.getEstado());
        assertNull(desafio.getCreatedAt());
    }

    @Test
    void cancelarMudaOEstadoParaCanceladoEPodeSerRepetido() {
        Desafio desafio = new Desafio(7L, "Desafio", LocalDate.of(2026, 12, 15));

        desafio.cancelar();
        desafio.cancelar();

        assertEquals(EstadoDesafio.CANCELADO, desafio.getEstado());
    }

    @Test
    void getterDoIdECriacaoRefletemOQueFoiPersistido() {
        Desafio desafio = new Desafio(7L, "Desafio", LocalDate.of(2026, 12, 15));
        OffsetDateTime agora = OffsetDateTime.now();
        ReflectionTestUtils.setField(desafio, "id", 100L);
        ReflectionTestUtils.setField(desafio, "createdAt", agora);

        assertEquals(100L, desafio.getId());
        assertSame(agora, desafio.getCreatedAt());
    }

    @Test
    void construtorProtegidoUsadoPeloHibernateCriaDesafioAtivoSemDados() throws Exception {
        Constructor<Desafio> constructor = Desafio.class.getDeclaredConstructor();
        constructor.setAccessible(true);

        Desafio desafio = constructor.newInstance();

        assertNull(desafio.getCriadorId());
        assertNull(desafio.getTitulo());
        assertEquals(EstadoDesafio.ATIVO, desafio.getEstado());
    }

    @Test
    void itemNovoNaoTemNenhumValor() {
        DesafioItem item = new DesafioItem();

        assertNull(item.getId());
        assertNull(item.getDesafioId());
        assertNull(item.getCatalogoId());
        assertNull(item.getMetaCargaKg());
        assertNull(item.getMetaRepeticoes());
        assertNull(item.getMetaSeries());
        assertNull(item.getMetaTempoS());
        assertNull(item.getMetaDistanciaM());
    }

    @Test
    void itemGuardaOsValoresDefinidos() {
        DesafioItem item = new DesafioItem();

        item.setDesafioId(100L);
        item.setCatalogoId(1L);
        item.setMetaCargaKg(new BigDecimal("80.50"));
        item.setMetaRepeticoes(100);
        item.setMetaSeries(3);
        item.setMetaTempoS(1800);
        item.setMetaDistanciaM(new BigDecimal("5000.00"));
        ReflectionTestUtils.setField(item, "id", 5L);

        assertEquals(5L, item.getId());
        assertEquals(100L, item.getDesafioId());
        assertEquals(1L, item.getCatalogoId());
        assertEquals(new BigDecimal("80.50"), item.getMetaCargaKg());
        assertEquals(100, item.getMetaRepeticoes());
        assertEquals(3, item.getMetaSeries());
        assertEquals(1800, item.getMetaTempoS());
        assertEquals(new BigDecimal("5000.00"), item.getMetaDistanciaM());
    }

    @Test
    void participanteNovoNaoTemNenhumValor() {
        DesafioParticipante participante = new DesafioParticipante();

        assertNull(participante.getId());
        assertNull(participante.getDesafioId());
        assertNull(participante.getUsuarioId());
        assertNull(participante.getEstado());
        assertNull(participante.getAceitoEm());
    }

    @Test
    void participanteGuardaOsValoresDefinidos() {
        DesafioParticipante participante = new DesafioParticipante();
        OffsetDateTime agora = OffsetDateTime.now();

        participante.setDesafioId(100L);
        participante.setUsuarioId(7L);
        participante.setEstado(EstadoParticipante.ACEITO);
        participante.setAceitoEm(agora);
        ReflectionTestUtils.setField(participante, "id", 9L);

        assertEquals(9L, participante.getId());
        assertEquals(100L, participante.getDesafioId());
        assertEquals(7L, participante.getUsuarioId());
        assertEquals(EstadoParticipante.ACEITO, participante.getEstado());
        assertSame(agora, participante.getAceitoEm());
    }

    @Test
    void enumsTemExatamenteOsValoresPermitidosPelaMigration() {
        assertEquals(List.of("ATIVO", "CANCELADO"),
                List.of(EstadoDesafio.values()).stream().map(Enum::name).toList());
        assertEquals(List.of("CONVIDADO", "ACEITO", "RECUSADO"),
                List.of(EstadoParticipante.values()).stream().map(Enum::name).toList());
    }
}