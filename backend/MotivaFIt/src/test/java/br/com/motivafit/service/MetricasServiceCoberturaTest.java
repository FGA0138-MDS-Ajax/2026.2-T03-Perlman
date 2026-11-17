package br.com.motivafit.service;

import br.com.motivafit.dto.response.EvolucaoPontoDTO;
import br.com.motivafit.exception.RequisicaoInvalidaException;
import br.com.motivafit.metricas.AgrupamentoEvolucao;
import br.com.motivafit.metricas.PeriodoMetricas;
import br.com.motivafit.repository.MetricasRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class MetricasServiceCoberturaTest {
    private final Clock clock = Clock.fixed(Instant.parse("2026-11-17T03:00:00Z"), ZoneId.of("America/Sao_Paulo"));

    @Test
    void cobreEvolucaoAtivosEPeriodos() {
        MetricasRepository repository = mock(MetricasRepository.class);
        MetricasService service = new MetricasService(repository, clock, 1);
        var linhas = new ArrayList<Object[]>();
        linhas.add(new Object[]{"2026-11-17", 1L, "Supino", "MUSCULACAO", 2L, 80.5, 10, 6L, 4800.0, null, null, null});
        when(repository.evolucao(anyLong(), any(), any(), any(), anyString())).thenReturn(linhas);
        when(repository.totalUsuarios()).thenReturn(0L, 4L);
        when(repository.ativos(any(), any())).thenReturn(0L, 3L);

        for (AgrupamentoEvolucao agrupamento : AgrupamentoEvolucao.values()) {
            List<EvolucaoPontoDTO> resposta = service.evolucao(1L, null, null, null, agrupamento);
            assertEquals("Supino", resposta.getFirst().exercicioNome());
            assertEquals(80.5, resposta.getFirst().cargaMaxKg().doubleValue());
        }
        assertEquals(0, service.ativos(null, null, AgrupamentoEvolucao.DIA).percentualAtivos());
        assertEquals(75, service.ativos(null, null, AgrupamentoEvolucao.MES).percentualAtivos());
        assertThrows(RequisicaoInvalidaException.class, () -> PeriodoMetricas.validar(LocalDate.of(2026, 2, 1), LocalDate.of(2026, 1, 1), clock));
        assertThrows(RequisicaoInvalidaException.class, () -> PeriodoMetricas.validar(LocalDate.of(2025, 1, 1), LocalDate.of(2026, 1, 3), clock));
    }

    @Test
    void cobreFrequenciaVaziaERegistrosDeResposta() {
        MetricasRepository repository = mock(MetricasRepository.class);
        MetricasService service = new MetricasService(repository, clock, 1);
        when(repository.frequenciaResumo(any(), any())).thenReturn(new Object[]{0, 0});
        when(repository.frequenciaDistribuicao(any(), any())).thenReturn(List.of());
        when(repository.frequenciaSerie(any(), any())).thenReturn(List.of());
        assertNotNull(service.frequenciaMedia(null, null));

        var faixa = new MetricasService.FaixaDTO("1-2", 1);
        var serie = new MetricasService.SerieFrequenciaDTO("2026-11-17", BigDecimal.ONE);
        var freq = new MetricasService.FrequenciaMediaDTO(LocalDate.now(clock), LocalDate.now(clock), BigDecimal.ONE, BigDecimal.ONE, List.of(faixa), List.of(serie));
        var usuario = new MetricasService.UsuariosAtivosDTO(LocalDate.now(clock), LocalDate.now(clock), AgrupamentoEvolucao.DIA, 1, 1, 100, List.of());
        assertEquals("1-2", freq.distribuicao().getFirst().faixa());
        assertEquals(1, usuario.ativosNoPeriodo());
    }

    @Test
    void cobreRankingRotinasERecordsRestantes() {
        MetricasRepository repository = mock(MetricasRepository.class);
        MetricasService service = new MetricasService(repository, clock, 1);
        when(repository.tempoTotais(any(), any())).thenReturn(new Object[]{0L, 0L, 0L});
        when(repository.tempoPorUsuario(any(), any(), anyInt())).thenReturn(List.of());
        assertTrue(service.rankingTempo(null, null, 1).ranking().isEmpty());
        assertThrows(RequisicaoInvalidaException.class, () -> service.rankingTempo(null, null, 0));
        assertThrows(RequisicaoInvalidaException.class, () -> service.exerciciosMaisRealizados(null, null, 51));
        assertThrows(RequisicaoInvalidaException.class, () -> service.rotinas(null, null, 0));

        var exercicio = new MetricasService.ExercicioItemDTO(0, 1, "X", "A", "G", 1, 1).comPosicao(2);
        var ranking = new MetricasService.RankingTempoItemDTO(1, 1, 1, 1);
        var adicao = new MetricasService.AdicaoRotinaDTO(1, 1, "T", 1, 1);
        var rotinas = new MetricasService.RotinasDTO(LocalDate.now(clock), LocalDate.now(clock), 1, List.of(new MetricasService.TipoRotinaDTO("A", 1)), BigDecimal.ONE, BigDecimal.ONE, List.of(adicao));
        var exercicios = new MetricasService.ExerciciosDTO(LocalDate.now(clock), LocalDate.now(clock), 0, List.of(exercicio));
        var retencao = new MetricasService.RetencaoDTO(LocalDate.now(clock), BigDecimal.ZERO, null, List.of());
        assertEquals(2, exercicio.posicao()); assertEquals(1, ranking.execucoes());
        assertEquals(1, rotinas.treinosAtivos()); assertEquals(1, exercicios.ranking().size()); assertNull(retencao.medianaDiasAtePrimeiroRegistro());
    }
}
