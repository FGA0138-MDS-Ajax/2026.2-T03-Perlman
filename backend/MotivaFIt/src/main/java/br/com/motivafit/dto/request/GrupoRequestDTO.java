package br.com.motivafit.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para criar ou atualizar um grupo")
public record GrupoRequestDTO(
        @NotBlank(message = "O nome do grupo é obrigatório")
        @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres")
        @Schema(description = "Nome do grupo", example = "Corredores de Brasília")
        String nome,
        @Size(max = 1000, message = "A descrição deve ter no máximo 1000 caracteres")
        @Schema(description = "Descrição do grupo", example = "Treinos e metas para corrida")
        String descricao
) {}
