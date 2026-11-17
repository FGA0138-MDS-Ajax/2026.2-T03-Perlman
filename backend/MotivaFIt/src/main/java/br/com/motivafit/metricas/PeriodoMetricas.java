package br.com.motivafit.metricas;
import br.com.motivafit.exception.RequisicaoInvalidaException;
import java.time.*;
public record PeriodoMetricas(LocalDate de, LocalDate ate, Instant inicio, Instant fim) {
    public static PeriodoMetricas validar(LocalDate de, LocalDate ate, Clock clock) {
        LocalDate dataAte = ate == null ? LocalDate.now(clock) : ate;
        LocalDate dataDe = de == null ? dataAte.minusDays(29) : de;
        if (dataDe.isAfter(dataAte)) {
            throw new RequisicaoInvalidaException("PERIODO_INVALIDO",
                    "A data inicial deve ser anterior ou igual à data final");
        }
        if (dataDe.plusDays(366).isBefore(dataAte)) {
            throw new RequisicaoInvalidaException("PERIODO_MUITO_LONGO",
                    "O período máximo é de 366 dias");
        }
        ZoneId zona = clock.getZone();
        return new PeriodoMetricas(dataDe, dataAte,
                dataDe.atStartOfDay(zona).toInstant(),
                dataAte.plusDays(1).atStartOfDay(zona).toInstant());
    }
}
