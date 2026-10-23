package br.com.motivafit.service;

import br.com.motivafit.dto.mapper.UsuarioMapper;
import br.com.motivafit.dto.request.UsuarioRequestDTO;
import br.com.motivafit.dto.response.UsuarioResponseDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {
    private final UsuarioRepository repository;

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    public UsuarioResponseDTO create(UsuarioRequestDTO body){
        try {
            if(repository.existsByEmail(body.email())) throw new IllegalArgumentException("Email já cadastrado");
            Usuario userEntity = repository.save(UsuarioMapper.toEntity(body));
            return UsuarioMapper.toDto(userEntity);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
