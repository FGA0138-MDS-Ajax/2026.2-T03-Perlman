package br.com.motivafit.service;

import br.com.motivafit.dto.request.ConviteAdminRequestDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {
    private final UsuarioRepository usuarioRepository;

    public AdminService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public void create(ConviteAdminRequestDTO body){
        Usuario usuarioEntity = usuarioRepository.findByEmail(body.Email()).orElseThrow(() -> new NaoEncontradoException("USUARIO_NAO_ENCONTRADO", "Usuario corresponde ao email enviado não existe"));

    }
}
