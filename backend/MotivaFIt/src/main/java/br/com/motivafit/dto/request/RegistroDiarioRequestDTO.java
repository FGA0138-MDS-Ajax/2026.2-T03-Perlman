package br.com.motivafit.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Schema(description = "Dados da execução de um exercício")
public record RegistroDiarioRequestDTO(
        @NotNull(message = "O exercício do catálogo é obrigatório")
        @Positive(message = "O id do exercício do catálogo deve ser positivo")
        @Schema(description = "Id do exercício no catálogo", example = "1")
        Long catalogoId,

        @Positive(message = "O id do treino deve ser positivo")
        @Schema(description = "Id do treino (opcional). Deve ser um treino seu.", example = "12", nullable = true)
        Long treinoId,

        @Positive(message = "O id do exercício do treino deve ser positivo")
        @Schema(description = "Id do exercício dentro do treino (opcional). Deve ser de um treino seu e corresponder ao catalogoId.", example = "30", nullable = true)
        Long exercicioId,

        @DecimalMin(value = "0.0", message = "A carga não pode ser negativa")
        @Digits(integer = 6, fraction = 2, message = "A carga deve ter no máximo 6 dígitos inteiros e 2 decimais")
        @Schema(description = "Carga em quilos. Apenas para musculação (0 é permitido).", example = "80.5", nullable = true)
        BigDecimal cargaKg,

        @Positive(message = "As repetições devem ser maiores que zero")
        @Schema(description = "Repetições por série. Obrigatório na musculação.", example = "8", nullable = true)
        Integer repeticoes,

        @Positive(message = "As séries devem ser maiores que zero")
        @Schema(description = "Quantidade de séries. Obrigatório na musculação.", example = "3", nullable = true)
        Integer series,

        @NotNull(message = "O tempo de execução (em segundos) é obrigatório")
        @Positive(message = "O tempo de execução deve ser maior que zero")
        @Schema(description = "Tempo de execução em segundos", example = "1200")
        Integer tempoS,

        @DecimalMin(value = "0.0", inclusive = false, message = "A distância deve ser maior que zero")
        @Digits(integer = 8, fraction = 2, message = "A distância deve ter no máximo 8 dígitos inteiros e 2 decimais")
        @Schema(description = "Distância em metros. Apenas para exercícios aeróbicos.", example = "5000", nullable = true)
        BigDecimal distanciaM,

        @Schema(description = "Data e hora da execução. Se omitida, usa o momento atual. Não pode estar no futuro.", type = "string", format = "date-time", nullable = true)
        OffsetDateTime executadoEm,

        @Size(max = 100, message = "A chave de idempotência deve ter no máximo 100 caracteres")
        @Schema(description = "Chave opcional para evitar registro duplicado se a requisição for repetida. Se já foi usada, devolve o registro original.", example = "7f1c2d3e-0000-4000-8000-000000000001", nullable = true)
        String chaveIdempotencia
) {
}