package br.com.motivafit.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Schema(description = "Execução de um exercício registrada pelo usuário")
public record RegistroDiarioResponseDTO(
        @Schema(description = "Identificador do registro", example = "101")
        Long id,
        @Schema(description = "Id do exercício no catálogo", example = "1")
        Long catalogoId,
        @Schema(description = "Id do treino, se informado", example = "12", nullable = true)
        Long treinoId,
        @Schema(description = "Id do exercício dentro do treino, se informado", example = "30", nullable = true)
        Long exercicioId,
        @Schema(description = "Nome do treino no momento da execução", example = "Treino A - Peito e Tríceps", nullable = true)
        String treinoNome,
        @Schema(description = "Nome do exercício no momento da execução", example = "Supino reto")
        String exercicioNome,
        @Schema(description = "Carga em quilos", example = "80.5", nullable = true)
        BigDecimal cargaKg,
        @Schema(description = "Repetições por série", example = "8", nullable = true)
        Integer repeticoes,
        @Schema(description = "Quantidade de séries", example = "3", nullable = true)
        Integer series,
        @Schema(description = "Tempo de execução em segundos", example = "1200", nullable = true)
        Integer tempoS,
        @Schema(description = "Distância em metros", example = "5000", nullable = true)
        BigDecimal distanciaM,
        @Schema(description = "Data e hora da execução", type = "string", format = "date-time")
        OffsetDateTime executadoEm
) {
}