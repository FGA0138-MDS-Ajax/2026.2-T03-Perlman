package br.com.motivafit.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Publicação de texto no feed do grupo")
public record GrupoFeedPostRequestDTO(
        @NotBlank(message = "O conteúdo da publicação é obrigatório")
        @Size(max = 1000, message = "A publicação deve ter no máximo 1000 caracteres")
        @Schema(description = "Texto da publicação", example = "Hoje bati meu recorde nos 5 km!", maxLength = 1000)
        String conteudo
) {
}
