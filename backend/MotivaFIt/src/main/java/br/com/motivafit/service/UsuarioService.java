package br.com.motivafit.service;

import br.com.motivafit.dto.mapper.UsuarioMapper;
import br.com.motivafit.dto.request.UsuarioRequestDTO;
import br.com.motivafit.dto.response.UsuarioResponseDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.motivafit.exception.ConflitoException;

@Service
public class UsuarioService {
    private final UsuarioRepository repository;
    private final UsuarioMapper usuarioMapper;

    public UsuarioService(UsuarioRepository repository, UsuarioMapper usuarioMapper) {
        this.repository = repository;
        this.usuarioMapper = usuarioMapper;
    }

    @Transactional
    public UsuarioResponseDTO create(UsuarioRequestDTO body){
        if(repository.existsByEmail(body.email()))
            throw new ConflitoException("EMAIL_JA_CADASTRADO", "Este e-mail já está cadastrado");
        Usuario userEntity = repository.save(usuarioMapper.toEntity(body));
        return usuarioMapper.toDto(userEntity);
    }
}
