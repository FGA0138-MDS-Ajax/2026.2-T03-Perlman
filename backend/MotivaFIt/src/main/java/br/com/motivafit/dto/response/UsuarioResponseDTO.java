package br.com.motivafit.dto.response;

import br.com.motivafit.enums.Perfil;

public record UsuarioResponseDTO(
        Long id,
        String email,
        Perfil perfil,
        Boolean ativo
) {
}
