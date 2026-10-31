package br.com.motivafit.dto.response;

import java.time.Instant;

public record ConviteCriado(Long id, String email, String token, Instant expiraEm) {
}
