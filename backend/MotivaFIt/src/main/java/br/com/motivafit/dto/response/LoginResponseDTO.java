package br.com.motivafit.dto.response;

import java.util.Date;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Credenciais de acesso. O refresh token é entregue exclusivamente por cookie.")
public record LoginResponseDTO(
        @Schema(description = "JWT Bearer para chamadas autenticadas", example = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3VhcmlvQG1vdGl2YWZpdC5jb20ifQ.signature")
        String token,
        @Schema(description = "Data e hora de expiração do JWT de acesso", type = "string", format = "date-time")
        Date expirationAt
) {
}
