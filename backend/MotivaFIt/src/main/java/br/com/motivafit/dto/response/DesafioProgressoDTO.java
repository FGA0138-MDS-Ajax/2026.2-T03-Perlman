package br.com.motivafit.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Progresso de um participante que aceitou o desafio")
public record DesafioProgressoDTO(
        @Schema(description = "Identificador da conta", example = "42")
        Long usuarioId,
        @Schema(description = "E-mail da conta", example = "amigo@motivafit.com")
        String email,
        @Schema(description = "Média do percentual de todos os exercícios (0 a 100)", example = "62.5")
        BigDecimal percentual,
        @Schema(description = "Verdadeiro quando todas as metas foram atingidas")
        boolean concluido,
        @Schema(description = "Progresso por exercício do desafio")
        List<Item> itens
) {
    @Schema(name = "DesafioProgressoItemDTO", description = "Valores acumulados de um exercício desde a criação do desafio até o fim do prazo")
    public record Item(
            @Schema(description = "Identificador do item do desafio", example = "5") Long itemId,
            @Schema(description = "Id do exercício no catálogo", example = "1") Long catalogoId,
            @Schema(description = "Carga máxima registrada, em kg") BigDecimal cargaMaxKg,
            @Schema(description = "Repetições acumuladas (repetições × séries)") Long repeticoes,
            @Schema(description = "Séries acumuladas") Long series,
            @Schema(description = "Tempo acumulado, em segundos") Long tempoS,
            @Schema(description = "Distância acumulada, em metros") BigDecimal distanciaM,
            @Schema(description = "Média do percentual das metas deste exercício (0 a 100)", example = "50") BigDecimal percentual,
            @Schema(description = "Verdadeiro quando todas as metas deste exercício foram atingidas") boolean concluido
    ) {
    }
}
