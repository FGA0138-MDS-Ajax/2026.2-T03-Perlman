package br.com.motivafit.dto.request;

import br.com.motivafit.enums.Estado;
import jakarta.validation.constraints.Email;

public record ConviteAdminRequestDTO(
        Long convidadorId,
        @Email
        String Email,
        String token_hash,
        String expiraEm,
        Estado estado

) {
}
