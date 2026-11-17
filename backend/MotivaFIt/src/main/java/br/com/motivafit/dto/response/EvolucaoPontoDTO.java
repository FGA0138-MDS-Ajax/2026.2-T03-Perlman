package br.com.motivafit.dto.response;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
@Schema(description="Agregação da evolução do usuário por período e exercício")
public record EvolucaoPontoDTO(
        String periodo,
        Long catalogoId,
        String exercicioNome,
        String modalidade,
        Long execucoes,
        BigDecimal cargaMaxKg,
        Integer repeticoesMax,
        Long seriesTotal,
        BigDecimal volumeKg,
        Long tempoTotalS,
        BigDecimal distanciaTotalM,
        BigDecimal paceSegPorKm) {
}
