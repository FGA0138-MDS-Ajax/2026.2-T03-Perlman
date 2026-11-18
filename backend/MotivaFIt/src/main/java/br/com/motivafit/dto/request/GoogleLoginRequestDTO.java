package br.com.motivafit.dto.request;

import jakarta.validation.constraints.NotBlank;
import io.swagger.v3.oas.annotations.media.Schema;

public record GoogleLoginRequestDTO(
        @NotBlank(message = "O token do Google é obrigatório")
        @Schema(description = "ID Token recebido do Google OAuth 2.0", example = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlMjM0NTY3ODkwYWJjZGVmZzEyMzQ1Njc4OTBhYmNkZSI.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwic3ViIjoiMTIzNDU2Nzg5MCJ9.signature")
        String idToken
) {
}
