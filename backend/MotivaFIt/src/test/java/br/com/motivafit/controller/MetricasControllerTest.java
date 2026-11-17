package br.com.motivafit.controller;

import br.com.motivafit.entity.Usuario;
import br.com.motivafit.metricas.AgrupamentoEvolucao;
import br.com.motivafit.service.MetricasService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.*;

class MetricasControllerTest {
    @Test
    void encaminhaEvolucaoParaUsuarioAutenticado() {
        MetricasService service = mock(MetricasService.class);
        MetricasController controller = new MetricasController(service);
        Usuario usuario = mock(Usuario.class);
        when(usuario.getId()).thenReturn(9L);
        var esperado = List.of(new br.com.motivafit.dto.response.EvolucaoPontoDTO("2026-11-17", 1L, "Supino", "MUSCULACAO", 1L, null, null, null, null, null, null, null));
        when(service.evolucao(9L, 1L, LocalDate.of(2026, 11, 1), LocalDate.of(2026, 11, 17), AgrupamentoEvolucao.DIA)).thenReturn(esperado);

        var resposta = controller.evolucao(usuario, 1L, LocalDate.of(2026, 11, 1), LocalDate.of(2026, 11, 17), AgrupamentoEvolucao.DIA);

        assertSame(esperado, resposta);
        verify(service).evolucao(9L, 1L, LocalDate.of(2026, 11, 1), LocalDate.of(2026, 11, 17), AgrupamentoEvolucao.DIA);
    }
}
