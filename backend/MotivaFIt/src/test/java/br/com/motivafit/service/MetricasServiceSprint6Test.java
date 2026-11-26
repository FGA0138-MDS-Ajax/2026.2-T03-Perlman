package br.com.motivafit.service;

import br.com.motivafit.exception.RequisicaoInvalidaException;
import br.com.motivafit.repository.MetricasRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MetricasServiceSprint6Test {
    @Mock private MetricasRepository repository;
    private MetricasService service;

    @BeforeEach
    void setUp() {
        service = new MetricasService(repository,
                Clock.fixed(Instant.parse("2026-11-17T03:00:00Z"), ZoneId.of("America/Sao_Paulo")), 2);
    }

    @Test
    void calculaFrequenciaComMediaMedianaDistribuicaoESerie() {
        when(repository.frequenciaResumo(any(), any())).thenReturn(new Object[]{3.25, 3.0});
        var distribuicao = new java.util.ArrayList<Object[]>(); distribuicao.add(new Object[]{"1-2", 4L});
        var serie = new java.util.ArrayList<Object[]>(); serie.add(new Object[]{"2026-11-09", 3.5});
        when(repository.frequenciaDistribuicao(any(), any())).thenReturn(distribuicao);
        when(repository.frequenciaSerie(any(), any())).thenReturn(serie);

        var resposta = service.frequenciaMedia(null, null);

        assertEquals(3.25, resposta.mediaDiasPorSemana().doubleValue());
        assertEquals(3.0, resposta.medianaDiasPorSemana().doubleValue());
        assertEquals("1-2", resposta.distribuicao().getFirst().faixa());
        assertEquals(3.5, resposta.serie().getFirst().mediaDiasAtivos().doubleValue());
        assertEquals("2026-10-19", resposta.de().toString());
    }

    @Test
    void ocultaRankingQuandoQuantidadeDeUsuariosAbaixoDoK() {
        when(repository.tempoTotais(any(), any())).thenReturn(new Object[]{100L, 50L, 50.0});
        var usuarios = new java.util.ArrayList<Object[]>(); usuarios.add(new Object[]{99L, 100L, 2L, 3L});
        when(repository.tempoPorUsuario(any(), any(), eq(10))).thenReturn(usuarios);

        var resposta = service.rankingTempo(null, null, 10);

        assertTrue(resposta.ocultoPorPrivacidade());
        assertTrue(resposta.ranking().isEmpty());
        assertEquals(100L, resposta.tempoTotalS());
    }

    @Test
    void montaRankingComPosicaoEValoresAgregados() {
        when(repository.tempoTotais(any(), any())).thenReturn(new Object[]{300L, 150L, 120L});
        var usuarios = new java.util.ArrayList<Object[]>();
        usuarios.add(new Object[]{10L, 200L, 4L, 8L}); usuarios.add(new Object[]{11L, 100L, 2L, 5L});
        when(repository.tempoPorUsuario(any(), any(), eq(10))).thenReturn(usuarios);

        var resposta = service.rankingTempo(null, null, 10);

        assertFalse(resposta.ocultoPorPrivacidade());
        assertEquals(1, resposta.ranking().getFirst().posicao());
        assertEquals(200L, resposta.ranking().getFirst().tempoTotalS());
        assertEquals(2, resposta.ranking().get(1).posicao());
    }

    @Test
    void rejeitaLimiteForaDaFaixa() {
        var excecao = assertThrows(RequisicaoInvalidaException.class,
                () -> service.rankingTempo(null, null, 51));
        assertEquals("LIMITE_INVALIDO", excecao.getCodigo());
    }
}
