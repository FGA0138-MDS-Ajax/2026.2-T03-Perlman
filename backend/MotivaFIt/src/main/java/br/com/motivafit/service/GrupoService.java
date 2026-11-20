package br.com.motivafit.service;

import br.com.motivafit.dto.request.AceitarConviteGrupoRequestDTO;
import br.com.motivafit.dto.request.ConviteGrupoRequestDTO;
import br.com.motivafit.dto.request.GrupoRequestDTO;
import br.com.motivafit.dto.response.*;
import br.com.motivafit.entity.*;
import br.com.motivafit.enums.EstadoConviteGrupo;
import br.com.motivafit.enums.PapelGrupo;
import br.com.motivafit.exception.AcessoNegadoException;
import br.com.motivafit.exception.ConflitoException;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.exception.RequisicaoInvalidaException;
import br.com.motivafit.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

@Service
public class GrupoService {
    private final GrupoRepository grupoRepository;
    private final GrupoMembroRepository membroRepository;
    private final ConviteGrupoRepository conviteRepository;
    private final GrupoFeedPostRepository feedRepository;
    private final UsuarioRepository usuarioRepository;

    public GrupoService(GrupoRepository grupoRepository, GrupoMembroRepository membroRepository,
                        ConviteGrupoRepository conviteRepository, GrupoFeedPostRepository feedRepository,
                        UsuarioRepository usuarioRepository) {
        this.grupoRepository = grupoRepository;
        this.membroRepository = membroRepository;
        this.conviteRepository = conviteRepository;
        this.feedRepository = feedRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<GrupoResponseDTO> findAll(Long usuarioId) {
        List<GrupoResponseDTO> resposta = new ArrayList<>();
        for (GrupoMembro membro : membroRepository.findByUsuarioIdOrderByEntradaEmDesc(usuarioId)) {
            Grupo grupo = grupoRepository.findById(membro.getGrupoId()).orElse(null);
            if (grupo != null) resposta.add(toGrupo(grupo, membro.getPapel()));
        }
        return resposta;
    }

    @Transactional
    public GrupoResponseDTO create(Long usuarioId, GrupoRequestDTO request) {
        Grupo grupo = new Grupo();
        grupo.setNome(request.nome().trim());
        grupo.setDescricao(request.descricao());
        grupo.setCriadorId(usuarioId);
        grupo = grupoRepository.save(grupo);

        GrupoMembro membro = new GrupoMembro();
        membro.setGrupoId(grupo.getId());
        membro.setUsuarioId(usuarioId);
        membro.setPapel(PapelGrupo.ADMIN);
        membroRepository.save(membro);
        return toGrupo(grupo, PapelGrupo.ADMIN);
    }

    @Transactional(readOnly = true)
    public GrupoResponseDTO findById(Long usuarioId, Long id) {
        Grupo grupo = getGrupo(id);
        GrupoMembro membro = getMembro(id, usuarioId);
        return toGrupo(grupo, membro.getPapel());
    }

    @Transactional
    public GrupoResponseDTO update(Long usuarioId, Long id, GrupoRequestDTO request) {
        Grupo grupo = getGrupo(id);
        exigirAdmin(id, usuarioId);
        grupo.setNome(request.nome().trim());
        grupo.setDescricao(request.descricao());
        return toGrupo(grupoRepository.save(grupo), PapelGrupo.ADMIN);
    }

    @Transactional
    public void delete(Long usuarioId, Long id) {
        Grupo grupo = getGrupo(id);
        exigirAdmin(id, usuarioId);
        grupoRepository.delete(grupo);
    }

    @Transactional(readOnly = true)
    public List<GrupoMembroResponseDTO> findMembros(Long usuarioId, Long id) {
        getGrupo(id);
        getMembro(id, usuarioId);
        return membroRepository.findByGrupoIdOrderByEntradaEmAsc(id).stream().map(m -> {
            String email = usuarioRepository.findById(m.getUsuarioId()).map(Usuario::getEmail).orElse(null);
            return new GrupoMembroResponseDTO(m.getUsuarioId(), email, m.getPapel(), m.getEntradaEm());
        }).toList();
    }

    @Transactional
    public void removerMembro(Long usuarioId, Long id, Long usuarioRemovidoId) {
        getGrupo(id);
        GrupoMembro autor = getMembro(id, usuarioId);
        GrupoMembro alvo = getMembro(id, usuarioRemovidoId);
        if (!usuarioId.equals(usuarioRemovidoId) && autor.getPapel() != PapelGrupo.ADMIN) {
            throw new AcessoNegadoException("ACESSO_NEGADO", "Somente administradores podem remover membros");
        }
        if (alvo.getPapel() == PapelGrupo.ADMIN
                && membroRepository.countByGrupoIdAndPapel(id, PapelGrupo.ADMIN) == 1) {
            throw new ConflitoException("ULTIMO_ADMINISTRADOR", "Não é possível remover o último administrador do grupo");
        }
        membroRepository.delete(alvo);
    }

    @Transactional
    public ConviteGrupoResponseDTO convidar(Long usuarioId, Long id, ConviteGrupoRequestDTO request) {
        getGrupo(id);
        exigirAdmin(id, usuarioId);
        usuarioRepository.findById(request.usuarioId()).orElseThrow(() ->
                new NaoEncontradoException("USUARIO_NAO_ENCONTRADO", "Usuário convidado não encontrado"));
        if (membroRepository.existsByGrupoIdAndUsuarioId(id, request.usuarioId())) {
            throw new ConflitoException("USUARIO_JA_MEMBRO", "O usuário já participa deste grupo");
        }
        if (conviteRepository.existsByGrupoIdAndConvidadoIdAndEstado(id, request.usuarioId(), EstadoConviteGrupo.PENDENTE)) {
            throw new ConflitoException("CONVITE_PENDENTE", "Já existe um convite pendente para este usuário");
        }
        ConviteGrupo convite = new ConviteGrupo();
        convite.setGrupoId(id);
        convite.setConvidanteId(usuarioId);
        convite.setConvidadoId(request.usuarioId());
        convite.setToken(UUID.randomUUID().toString());
        convite.setEstado(EstadoConviteGrupo.PENDENTE);
        convite.setExpiraEm(OffsetDateTime.now().plusDays(7));
        convite = conviteRepository.save(convite);
        return new ConviteGrupoResponseDTO(convite.getId(), id, request.usuarioId(), convite.getToken(), convite.getExpiraEm());
    }

    @Transactional
    public void aceitarConvite(Long usuarioId, AceitarConviteGrupoRequestDTO request) {
        ConviteGrupo convite = conviteRepository.findByToken(request.token())
                .orElseThrow(() -> new NaoEncontradoException("CONVITE_NAO_ENCONTRADO", "Convite não encontrado"));
        if (!convite.getConvidadoId().equals(usuarioId)) {
            throw new AcessoNegadoException("CONVITE_DE_OUTRO_USUARIO", "Este convite pertence a outro usuário");
        }
        if (convite.getEstado() != EstadoConviteGrupo.PENDENTE) {
            throw new RequisicaoInvalidaException("CONVITE_INVALIDO", "O convite não está pendente");
        }
        if (convite.getExpiraEm().isBefore(OffsetDateTime.now())) {
            convite.setEstado(EstadoConviteGrupo.EXPIRADO);
            throw new RequisicaoInvalidaException("CONVITE_EXPIRADO", "O convite expirou");
        }
        if (!membroRepository.existsByGrupoIdAndUsuarioId(convite.getGrupoId(), usuarioId)) {
            GrupoMembro membro = new GrupoMembro();
            membro.setGrupoId(convite.getGrupoId());
            membro.setUsuarioId(usuarioId);
            membro.setPapel(PapelGrupo.MEMBRO);
            membroRepository.save(membro);

            GrupoFeedPost post = new GrupoFeedPost();
            post.setGrupoId(convite.getGrupoId());
            post.setUsuarioId(usuarioId);
            post.setTipo("MEMBRO_ENTROU");
            post.setConteudo("Um novo membro entrou no grupo");
            feedRepository.save(post);
        }
        convite.setEstado(EstadoConviteGrupo.ACEITO);
        conviteRepository.save(convite);
    }

    @Transactional(readOnly = true)
    public List<GrupoFeedResponseDTO> findFeed(Long usuarioId, Long id) {
        getGrupo(id);
        getMembro(id, usuarioId);
        return feedRepository.findByGrupoIdOrderByCriadoEmDesc(id).stream()
                .map(p -> new GrupoFeedResponseDTO(p.getId(), p.getUsuarioId(), p.getTipo(), p.getConteudo(), p.getCriadoEm()))
                .toList();
    }

    private Grupo getGrupo(Long id) {
        return grupoRepository.findById(id).orElseThrow(() ->
                new NaoEncontradoException("GRUPO_NAO_ENCONTRADO", "Grupo não encontrado"));
    }

    private GrupoMembro getMembro(Long grupoId, Long usuarioId) {
        return membroRepository.findByGrupoIdAndUsuarioId(grupoId, usuarioId).orElseThrow(() ->
                new AcessoNegadoException("USUARIO_NAO_MEMBRO", "Você não participa deste grupo"));
    }

    private void exigirAdmin(Long grupoId, Long usuarioId) {
        GrupoMembro membro = getMembro(grupoId, usuarioId);
        if (membro.getPapel() != PapelGrupo.ADMIN) {
            throw new AcessoNegadoException("ACESSO_NEGADO", "Somente administradores podem realizar esta operação");
        }
    }

    private GrupoResponseDTO toGrupo(Grupo grupo, PapelGrupo papel) {
        return new GrupoResponseDTO(grupo.getId(), grupo.getNome(), grupo.getDescricao(),
                grupo.getCriadorId(), papel, grupo.getCriadoEm(), grupo.getAtualizadoEm());
    }
}
