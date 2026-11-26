package br.com.motivafit.dto.request;

import br.com.motivafit.enums.Visibilidade;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Dados para criar um desafio")
public record DesafioRequestDTO(
        @NotBlank(message = "O título do desafio é obrigatório")
        @Size(max = 100, message = "O título do desafio deve ter no máximo 100 caracteres")
        @Schema(description = "Título do desafio (máximo de 100 caracteres)", example = "Desafio das 100 repetições")
        String titulo,

        @NotNull(message = "O prazo do desafio é obrigatório")
        @Schema(description = "Último dia do desafio, inclusive (fuso America/Sao_Paulo). Não pode estar no passado.", type = "string", format = "date", example = "2026-12-15")
        LocalDate prazo,

        @Size(max = 1000, message = "A descrição deve ter no máximo 1000 caracteres")
        @Schema(description = "Descrição do desafio", example = "Complete as metas até o fim do mês")
        String descricao,

        @Schema(description = "Visibilidade do desafio. Se omitida, será PRIVADO.", example = "PRIVADO")
        Visibilidade visibilidade,

        @NotEmpty(message = "O desafio precisa ter ao menos um exercício")
        @Size(max = 20, message = "O desafio pode ter no máximo 20 exercícios")
        @Valid
        @Schema(description = "Exercícios do catálogo e suas metas (sem repetir o mesmo exercício)")
        List<DesafioItemRequestDTO> itens
) {
    public DesafioRequestDTO(String titulo, LocalDate prazo, List<DesafioItemRequestDTO> itens) {
        this(titulo, prazo, null, null, itens);
    }
}
