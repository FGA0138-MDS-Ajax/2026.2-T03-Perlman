package br.com.motivafit.service;

import br.com.motivafit.dto.mapper.UsuarioMapper;
import br.com.motivafit.dto.request.UsuarioRequestDTO;
import br.com.motivafit.dto.response.UsuarioResponseDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.motivafit.exception.ConflitoException;

import java.util.List;

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

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> findAll(){
        return usuarioMapper.toDtos(repository.findAll());
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO findById(Long id){
        return usuarioMapper.toDto(repository.findById(id).orElseThrow(() -> new NaoEncontradoException("USUARIO_NAO_ENCONTRADO", "Usuário com id " + id + " não existe")));
    }

    @Transactional
    public void delete(Long id){
        Usuario usuario = repository.findById(id).orElseThrow(() -> new NaoEncontradoException("USUARIO_NAO_ENCONTRADO", "Usuário com id " + id + " não existe"));
        repository.delete(usuario);
    }
}
