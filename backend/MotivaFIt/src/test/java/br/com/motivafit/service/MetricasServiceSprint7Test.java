package br.com.motivafit.service;

import br.com.motivafit.exception.RequisicaoInvalidaException;
import br.com.motivafit.repository.MetricasRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MetricasServiceSprint7Test {
    @Mock private MetricasRepository repository;
    private MetricasService service;

    @BeforeEach
    void setUp() {
        service = new MetricasService(repository,
                Clock.fixed(Instant.parse("2026-11-17T03:00:00Z"), ZoneId.of("America/Sao_Paulo")), 2);
    }

    @Test
    void omiteExercicioAbaixoDoKMinimo() {
        var itens = new ArrayList<Object[]>();
        itens.add(new Object[]{1L, "Supino", "MUSCULACAO", "Peito", 20L, 2L});
        itens.add(new Object[]{2L, "Corrida", "AEROBICO", "", 3L, 1L});
        when(repository.exerciciosMaisRealizados(any(), any(), eq(10))).thenReturn(itens);

        var resposta = service.exerciciosMaisRealizados(null, null, 10);

        assertEquals(1, resposta.ranking().size());
        assertEquals(1, resposta.ranking().getFirst().posicao());
        assertEquals("Supino", resposta.ranking().getFirst().nome());
    }

    @Test
    void calculaResumoDeRotinasSemDivisaoPorZero() {
        when(repository.rotinasResumo(any(), any())).thenReturn(new Object[]{0L, 0L});
        when(repository.rotinasPorTipo()).thenReturn(java.util.List.of());
        when(repository.rotinasMaisAdicionadas(any(), any(), eq(10))).thenReturn(java.util.List.of());

        var resposta = service.rotinas(null, null, 10);

        assertEquals(0, resposta.treinosAtivos());
        assertEquals(0, resposta.percentualTreinosPublicos().intValue());
    }

    @Test
    void validaNumeroDeCoortes() {
        var erro = assertThrows(RequisicaoInvalidaException.class, () -> service.retencao(null, 27));
        assertEquals("PARAMETRO_INVALIDO", erro.getCodigo());
    }

    @Test
    void retornaRetencaoVaziaParaSemDados() {
        var resposta = service.retencao(null, 8);
        assertEquals("2026-11-17", resposta.ate().toString());
        assertTrue(resposta.coortes().isEmpty());
    }
}
