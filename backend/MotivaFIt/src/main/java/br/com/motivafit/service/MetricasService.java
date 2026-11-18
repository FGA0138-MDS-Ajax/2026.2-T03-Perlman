package br.com.motivafit.service;

import br.com.motivafit.dto.response.EvolucaoPontoDTO;
import br.com.motivafit.exception.RequisicaoInvalidaException;
import br.com.motivafit.metricas.AgrupamentoEvolucao;
import br.com.motivafit.metricas.PeriodoMetricas;
import br.com.motivafit.repository.MetricasRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

@Service
public class MetricasService {
    private final MetricasRepository repository;
    private final Clock clock;
    private final int kMinimo;

    public MetricasService(MetricasRepository repository, Clock clock,
                           @Value("${motivafit.metricas.k-minimo:5}") int kMinimo) {
        this.repository = repository;
        this.clock = clock;
        this.kMinimo = kMinimo;
    }

    public List<EvolucaoPontoDTO> evolucao(Long usuarioId, Long catalogoId, LocalDate de, LocalDate ate,
                                           AgrupamentoEvolucao agrupamento) {
        PeriodoMetricas periodo = PeriodoMetricas.validar(de, ate, clock);
        String grupo = switch (agrupamento) {
            case DIA -> "day";
            case SEMANA -> "week";
            case MES -> "month";
        };
        return repository.evolucao(usuarioId, periodo.inicio(), periodo.fim(), catalogoId, grupo)
                .stream().map(this::mapearEvolucao).toList();
    }

    public UsuariosAtivosDTO ativos(LocalDate de, LocalDate ate, AgrupamentoEvolucao agrupamento) {
        PeriodoMetricas periodo = PeriodoMetricas.validar(de, ate, clock);
        long total = repository.totalUsuarios();
        long ativos = repository.ativos(periodo.inicio(), periodo.fim());
        double percentual = total == 0 ? 0 : arredondar(ativos * 100.0 / total, 1);
        return new UsuariosAtivosDTO(periodo.de(), periodo.ate(), agrupamento, total,
                ativos, percentual, List.of());
    }

    public FrequenciaMediaDTO frequenciaMedia(LocalDate de, LocalDate ate) {
        PeriodoMetricas periodo = PeriodoMetricas.validar(de, ate, clock);
        Object[] resumo = repository.frequenciaResumo(periodo.inicio(), periodo.fim());
        List<FaixaDTO> distribuicao = repository.frequenciaDistribuicao(periodo.inicio(), periodo.fim()).stream()
                .map(row -> new FaixaDTO((String) get(row, 0), longValue(get(row, 1)))).toList();
        List<SerieFrequenciaDTO> serie = repository.frequenciaSerie(periodo.inicio(), periodo.fim()).stream()
                .map(row -> new SerieFrequenciaDTO((String) get(row, 0), decimal(get(row, 1)))).toList();
        return new FrequenciaMediaDTO(periodo.de(), periodo.ate(), decimal(get(resumo, 0)),
                decimal(get(resumo, 1)), distribuicao, serie);
    }

    public RankingTempoDTO rankingTempo(LocalDate de, LocalDate ate, int limite) {
        if (limite < 1 || limite > 50) {
            throw new RequisicaoInvalidaException("LIMITE_INVALIDO",
                    "O limite deve estar entre 1 e 50");
        }
        PeriodoMetricas periodo = PeriodoMetricas.validar(de, ate, clock);
        Object[] totais = repository.tempoTotais(periodo.inicio(), periodo.fim());
        List<Object[]> usuarios = repository.tempoPorUsuario(periodo.inicio(), periodo.fim(), limite);
        boolean oculto = usuarios.size() < kMinimo;
        List<RankingTempoItemDTO> ranking = oculto ? List.of() : java.util.stream.IntStream.range(0, usuarios.size())
                .mapToObj(i -> {
                    Object[] row = usuarios.get(i);
                    return new RankingTempoItemDTO(i + 1, longValue(get(row, 1)),
                            longValue(get(row, 2)), longValue(get(row, 3)));
                }).toList();
        return new RankingTempoDTO(periodo.de(), periodo.ate(), longValue(get(totais, 0)),
                longValue(get(totais, 1)), decimal(get(totais, 2)), oculto, ranking);
    }

    private EvolucaoPontoDTO mapearEvolucao(Object[] row) {
        return new EvolucaoPontoDTO((String) get(row, 0), longValue(get(row, 1)), (String) get(row, 2),
                (String) get(row, 3), longValue(get(row, 4)), decimal(get(row, 5)), integer(get(row, 6)),
                longValue(get(row, 7)), decimal(get(row, 8)), longValue(get(row, 9)), decimal(get(row, 10)),
                decimal(get(row, 11)));
    }

    private static Object get(Object[] row, int index) {
        if (row == null || index >= row.length) return null;
        return row[index];
    }

    private static long longValue(Object value) {
        if (value == null) return 0;
        if (value instanceof Number) return ((Number) value).longValue();
        if (value instanceof Object[]) {
            Object[] arr = (Object[]) value;
            if (arr.length == 0) return 0;
            return longValue(arr[0]);
        }
        return Long.parseLong(value.toString());
    }

    private static Integer integer(Object value) {
        if (value == null) return null;
        if (value instanceof Number) return ((Number) value).intValue();
        if (value instanceof Object[]) {
            Object[] arr = (Object[]) value;
            if (arr.length == 0) return null;
            return integer(arr[0]);
        }
        return Integer.parseInt(value.toString());
    }

    private static BigDecimal decimal(Object value) {
        if (value == null) return null;
        if (value instanceof Object[]) {
            Object[] arr = (Object[]) value;
            if (arr.length == 0) return null;
            return decimal(arr[0]);
        }
        return new BigDecimal(value.toString());
    }

    private static double arredondar(double value, int casas) {
        double fator = Math.pow(10, casas);
        return Math.round(value * fator) / fator;
    }

    public record UsuariosAtivosDTO(LocalDate de, LocalDate ate, AgrupamentoEvolucao agrupamento, long totalContas, long ativosNoPeriodo, double percentualAtivos, List<Object> serie) {}
    public record FaixaDTO(String faixa, long usuarios) {}
    public record SerieFrequenciaDTO(String semana, BigDecimal mediaDiasAtivos) {}
    public record FrequenciaMediaDTO(LocalDate de, LocalDate ate, BigDecimal mediaDiasPorSemana,
                                     BigDecimal medianaDiasPorSemana, List<FaixaDTO> distribuicao,
                                     List<SerieFrequenciaDTO> serie) {}
    public record RankingTempoItemDTO(int posicao, long tempoTotalS, long diasAtivos, long execucoes) {}
    public record RankingTempoDTO(LocalDate de, LocalDate ate, long tempoTotalS,
                                  long mediaPorUsuarioAtivoS, BigDecimal medianaPorUsuarioAtivoS,
                                  boolean ocultoPorPrivacidade, List<RankingTempoItemDTO> ranking) {}

    public ExerciciosDTO exerciciosMaisRealizados(LocalDate de, LocalDate ate, int limite) {
        validarLimite(limite);
        PeriodoMetricas periodo = PeriodoMetricas.validar(de, ate, clock);
        List<ExercicioItemDTO> itens = repository.exerciciosMaisRealizados(
                        periodo.inicio(), periodo.fim(), limite).stream()
                .map(row -> new ExercicioItemDTO(0, longValue(get(row, 0)), (String) get(row, 1),
                        (String) get(row, 2), (String) get(row, 3), longValue(get(row, 4)), longValue(get(row, 5))))
                .filter(item -> item.usuariosDistintos() >= kMinimo)
                .toList();
        List<ExercicioItemDTO> ranking = java.util.stream.IntStream.range(0, itens.size())
                .mapToObj(index -> itens.get(index).comPosicao(index + 1)).toList();
        return new ExerciciosDTO(periodo.de(), periodo.ate(), 0, ranking);
    }

    public RotinasDTO rotinas(LocalDate de, LocalDate ate, int limite) {
        validarLimite(limite);
        PeriodoMetricas periodo = PeriodoMetricas.validar(de, ate, clock);
        Object[] resumo = repository.rotinasResumo(periodo.inicio(), periodo.fim());
        List<TipoRotinaDTO> tipos = repository.rotinasPorTipo().stream()
                .map(row -> new TipoRotinaDTO((String) get(row, 0), longValue(get(row, 1)))).toList();
        List<AdicaoRotinaDTO> adicoes = repository.rotinasMaisAdicionadas(
                        periodo.inicio(), periodo.fim(), limite).stream()
                .map(row -> new AdicaoRotinaDTO(0, longValue(get(row, 0)), (String) get(row, 1),
                        longValue(get(row, 2)), longValue(get(row, 3)))).toList();
        return new RotinasDTO(periodo.de(), periodo.ate(), longValue(get(resumo, 0)), tipos,
                percentual(get(resumo, 1), get(resumo, 0)), BigDecimal.ZERO, adicoes);
    }

    public RetencaoDTO retencao(LocalDate ate, int coortes) {
        if (coortes < 1 || coortes > 26) {
            throw new RequisicaoInvalidaException("PARAMETRO_INVALIDO", "Coortes deve estar entre 1 e 26");
        }
        LocalDate data = ate == null ? LocalDate.now(clock) : ate;
        return new RetencaoDTO(data, BigDecimal.ZERO, null, List.of());
    }

    private void validarLimite(int limite) {
        if (limite < 1 || limite > 50) {
            throw new RequisicaoInvalidaException("LIMITE_INVALIDO", "O limite deve estar entre 1 e 50");
        }
    }

    private BigDecimal percentual(Object parte, Object total) {
        long totalLong = longValue(total);
        return totalLong == 0 ? BigDecimal.ZERO : BigDecimal.valueOf(longValue(parte) * 100.0 / totalLong);
    }

    public record ExercicioItemDTO(int posicao, long catalogoId, String nome, String modalidade,
                                   String grupoMuscular, long execucoes, long usuariosDistintos) {
        public ExercicioItemDTO comPosicao(int novaPosicao) {
            return new ExercicioItemDTO(novaPosicao, catalogoId, nome, modalidade, grupoMuscular,
                    execucoes, usuariosDistintos);
        }
    }

    public record ExerciciosDTO(LocalDate de, LocalDate ate, long suprimidos,
                                List<ExercicioItemDTO> ranking) {}

    public record TipoRotinaDTO(String tipo, long treinos) {}

    public record AdicaoRotinaDTO(int posicao, long treinoId, String nome, long adicoes,
                                  long usuariosDistintos) {}

    public record RotinasDTO(LocalDate de, LocalDate ate, long treinosAtivos,
                             List<TipoRotinaDTO> porTipo, BigDecimal percentualTreinosPublicos,
                             BigDecimal percentualRegistrosComTreino,
                             List<AdicaoRotinaDTO> treinosPublicosMaisAdicionados) {}

    public record RetencaoDTO(LocalDate ate, BigDecimal taxaAtivacao7Dias,
                              Integer medianaDiasAtePrimeiroRegistro, List<Object> coortes) {}
}
