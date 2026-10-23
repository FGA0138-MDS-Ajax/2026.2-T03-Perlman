package br.com.motivafit.dto.mapper;

import br.com.motivafit.dto.request.UsuarioRequestDTO;
import br.com.motivafit.dto.response.UsuarioResponseDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.Perfil;
import org.springframework.security.crypto.password.PasswordEncoder;

public class UsuarioMapper {
    private static PasswordEncoder encoder = null;

    public UsuarioMapper(PasswordEncoder passwordEncoder) {
        encoder = passwordEncoder;
    }

    static public Usuario toEntity(UsuarioRequestDTO dto){
        Usuario usuario = new Usuario();
        usuario.setEmail(dto.email());
        usuario.setAtivo(true);
        usuario.setPerfil(Perfil.USUARIO);
        usuario.setSenhaHash(encoder.encode(dto.senha()));
        return usuario;
    }

    static public UsuarioResponseDTO toDto(Usuario entity){
        return new UsuarioResponseDTO(entity.getId(), entity.getEmail(), entity.getPerfil(), entity.getAtivo());
    }
}
