package br.com.motivafit.dto.response;

import java.util.Date;

public record LoginResponseDTO(
        String token,
        Date expirationAt
) {
}
