package br.com.motivafit.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Página de resultados")
public record PaginaDTO<T>(
        @Schema(description = "Itens da página") List<T> itens,
        @Schema(description = "Total de itens em todas as páginas", example = "137") long total,
        @Schema(description = "Número da página, começando em 0", example = "0") int pagina,
        @Schema(description = "Itens por página", example = "50") int tamanho
) {
}
