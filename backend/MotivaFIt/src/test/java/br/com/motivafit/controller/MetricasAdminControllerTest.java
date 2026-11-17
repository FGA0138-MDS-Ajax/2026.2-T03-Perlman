package br.com.motivafit.controller;

import br.com.motivafit.metricas.AgrupamentoEvolucao;
import br.com.motivafit.service.MetricasService;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.mockito.Mockito.*;

class MetricasAdminControllerTest {
    @Test
    void encaminhaTodasAsConsultasAdministrativas() {
        MetricasService service = mock(MetricasService.class);
        MetricasAdminController controller = new MetricasAdminController(service);
        LocalDate data = LocalDate.of(2026, 11, 17);
        controller.ativos(data, data, AgrupamentoEvolucao.DIA);
        controller.frequencia(data, data);
        controller.ranking(data, data, 10);
        controller.exercicios(data, data, 10);
        controller.rotinas(data, data, 10);
        controller.retencao(data, 8);
        verify(service).ativos(data, data, AgrupamentoEvolucao.DIA);
        verify(service).frequenciaMedia(data, data);
        verify(service).rankingTempo(data, data, 10);
        verify(service).exerciciosMaisRealizados(data, data, 10);
        verify(service).rotinas(data, data, 10);
        verify(service).retencao(data, 8);
    }
}
