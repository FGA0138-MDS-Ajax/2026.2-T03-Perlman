package br.com.motivafit.dto.response;

import br.com.motivafit.enums.EstadoDesafio;
import br.com.motivafit.enums.Visibilidade;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Desafio e seus exercícios")
public record DesafioResponseDTO(
        @Schema(description = "Identificador do desafio", example = "7")
        Long id,
        @Schema(description = "Título do desafio", example = "Desafio das 100 repetições")
        String titulo,
        @Schema(description = "Último dia do desafio, inclusive", type = "string", format = "date", example = "2026-12-15")
        LocalDate prazo,
        @Schema(description = "Descrição do desafio", example = "Complete as metas até o fim do mês")
        String descricao,
        @Schema(description = "Visibilidade do desafio", example = "PRIVADO")
        Visibilidade visibilidade,
        @Schema(description = "Estado do desafio", example = "ATIVO")
        EstadoDesafio estado,
        @Schema(description = "Indica se o usuário autenticado é o criador do desafio (só o criador pode removê-lo)", example = "true")
        boolean souCriador,
        @Schema(description = "Exercícios do desafio com as metas")
        List<DesafioItemResponseDTO> itens
) {
    public DesafioResponseDTO(Long id, String titulo, LocalDate prazo, EstadoDesafio estado,
                              boolean souCriador, List<DesafioItemResponseDTO> itens) {
        this(id, titulo, prazo, null, Visibilidade.PRIVADO, estado, souCriador, itens);
    }
}
