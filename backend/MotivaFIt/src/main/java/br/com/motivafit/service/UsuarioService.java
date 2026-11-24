package br.com.motivafit.service;

import br.com.motivafit.dto.mapper.UsuarioMapper;
import br.com.motivafit.dto.request.PreferenciasRequestDTO;
import br.com.motivafit.dto.request.UsuarioRequestDTO;
import br.com.motivafit.dto.response.PreferenciasResponseDTO;
import br.com.motivafit.dto.response.UsuarioResponseDTO;
import br.com.motivafit.dto.response.UsuarioResumoDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.exception.ConflitoException;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.exception.RequisicaoInvalidaException;
import br.com.motivafit.repository.RefreshTokenRepository;
import br.com.motivafit.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class UsuarioService {
    private final UsuarioRepository repository;
    private final UsuarioMapper usuarioMapper;
    private final RefreshTokenRepository refreshTokenRepository;

    public UsuarioService(UsuarioRepository repository, UsuarioMapper usuarioMapper, RefreshTokenRepository refreshTokenRepository) {
        this.repository = repository;
        this.usuarioMapper = usuarioMapper;
        this.refreshTokenRepository = refreshTokenRepository;
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

    @Transactional(readOnly = true)
    public PreferenciasResponseDTO buscarPreferencias(Long usuarioId) {
        return new PreferenciasResponseDTO(buscarUsuario(usuarioId).getTema());
    }

    @Transactional
    public PreferenciasResponseDTO salvarPreferencias(Long usuarioId, PreferenciasRequestDTO request) {
        Usuario usuario = buscarUsuario(usuarioId);
        usuario.setTema(request.tema());
        return new PreferenciasResponseDTO(repository.save(usuario).getTema());
    }

    /**
     * Localiza outra conta ativa pelo e-mail exato (sem diferenciar maiúsculas), para convites e amizades.
     * A busca não é parcial, para não permitir enumerar os e-mails cadastrados.
     */
    @Transactional(readOnly = true)
    public UsuarioResumoDTO buscarPorEmail(Long usuarioId, String email) {
        String normalizado = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        if (normalizado.isEmpty()) {
            throw new RequisicaoInvalidaException("EMAIL_OBRIGATORIO", "Informe o e-mail da conta");
        }
        return repository.findByEmailIgnoreCase(normalizado)
                .filter(usuario -> Boolean.TRUE.equals(usuario.getAtivo()))
                .filter(usuario -> !usuario.getId().equals(usuarioId))
                .map(usuario -> new UsuarioResumoDTO(usuario.getId(), usuario.getEmail()))
                .orElseThrow(() -> new NaoEncontradoException("USUARIO_NAO_ENCONTRADO", "Nenhuma outra conta ativa com este e-mail"));
    }

    private Usuario buscarUsuario(Long id) {
        return repository.findById(id).orElseThrow(() -> new NaoEncontradoException("USUARIO_NAO_ENCONTRADO", "Usuário com id " + id + " não existe"));
    }

    @Transactional
    public void delete(Long id){
        Usuario usuario = repository.findById(id).orElseThrow(() -> new NaoEncontradoException("USUARIO_NAO_ENCONTRADO", "Usuário com id " + id + " não existe"));
        refreshTokenRepository.deleteByUsuarioId(usuario);
        repository.delete(usuario);
    }
}
