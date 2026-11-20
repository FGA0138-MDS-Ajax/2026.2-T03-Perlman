package br.com.motivafit.service;

import br.com.motivafit.dto.request.AmizadeRequestDTO;
import br.com.motivafit.dto.request.AmizadeUpdateRequestDTO;
import br.com.motivafit.dto.response.AmizadeResponseDTO;
import br.com.motivafit.entity.Amizade;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.EstadoAmizade;
import br.com.motivafit.exception.AcessoNegadoException;
import br.com.motivafit.exception.ConflitoException;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.exception.RequisicaoInvalidaException;
import br.com.motivafit.repository.AmizadeRepository;
import br.com.motivafit.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AmizadeService {

    private final AmizadeRepository amizadeRepository;
    private final UsuarioRepository usuarioRepository;

    public AmizadeService(AmizadeRepository amizadeRepository, UsuarioRepository usuarioRepository) {
        this.amizadeRepository = amizadeRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<AmizadeResponseDTO> findAll(Long usuarioId) {
        List<Amizade> amizades = amizadeRepository.findAtivasDoUsuario(
                usuarioId, EstadoAmizade.RECUSADA);

        if (amizades.isEmpty()) {
            return List.of();
        }

        return montarRespostas(amizades);
    }

    @Transactional
    public AmizadeResponseDTO create(Long usuarioId, AmizadeRequestDTO request) {
        Long destinatarioId = request.destinatarioId();

        if (destinatarioId.equals(usuarioId)) {
            throw new ConflitoException(
                    "NAO_SE_AUTO_CONVIDAR", "Você não pode enviar solicitação de amizade para si mesmo");
        }

        Usuario destinatario = usuarioRepository.findById(destinatarioId)
                .orElseThrow(() -> new NaoEncontradoException(
                        "USUARIO_NAO_ENCONTRADO", "Usuário destinatário não encontrado"));

        List<Amizade> existentes = amizadeRepository.findEntreUsuarios(usuarioId, destinatarioId);
        for (Amizade existente : existentes) {
            if (existente.getEstado() != EstadoAmizade.RECUSADA) {
                throw new ConflitoException(
                        "AMIZADE_JA_EXISTE", "Já existe uma solicitação de amizade entre vocês");
            }
        }

        Amizade amizade = new Amizade();
        amizade.setSolicitanteId(usuarioId);
        amizade.setDestinatarioId(destinatarioId);
        amizade.setEstado(EstadoAmizade.PENDENTE);
        amizade = amizadeRepository.save(amizade);

        return toResponse(amizade, usuarioId);
    }

    @Transactional
    public AmizadeResponseDTO update(Long usuarioId, Long id, AmizadeUpdateRequestDTO request) {
        Amizade amizade = amizadeRepository.findByIdAndUsuario(id, usuarioId, EstadoAmizade.RECUSADA)
                .orElseThrow(() -> new NaoEncontradoException(
                        "AMIZADE_NAO_ENCONTRADA", "Amizade não encontrada"));

        if (!usuarioId.equals(amizade.getDestinatarioId())) {
            throw new AcessoNegadoException(
                    "SOMENTE_DESTINATARIO", "Somente o destinatário pode responder à solicitação");
        }

        if (amizade.getEstado() != EstadoAmizade.PENDENTE) {
            throw new RequisicaoInvalidaException(
                    "ESTADO_INVALIDO", "A solicitação já foi respondida");
        }

        EstadoAmizade novoEstado = request.estado();
        if (novoEstado != EstadoAmizade.ACEITA && novoEstado != EstadoAmizade.RECUSADA) {
            throw new RequisicaoInvalidaException(
                    "ESTADO_INVALIDO", "O estado deve ser ACEITA ou RECUSADA");
        }

        amizade.setEstado(novoEstado);
        amizade.setAtualizadoEm(OffsetDateTime.now());
        amizade = amizadeRepository.save(amizade);

        return toResponse(amizade, usuarioId);
    }

    @Transactional
    public void delete(Long usuarioId, Long id) {
        Amizade amizade = amizadeRepository.findByIdAndUsuario(id, usuarioId, EstadoAmizade.RECUSADA)
                .orElseThrow(() -> new NaoEncontradoException(
                        "AMIZADE_NAO_ENCONTRADA", "Amizade não encontrada"));

        if (amizade.getEstado() == EstadoAmizade.PENDENTE && !usuarioId.equals(amizade.getSolicitanteId())) {
            throw new AcessoNegadoException(
                    "SOMENTE_SOLICITANTE", "Somente o solicitante pode cancelar uma solicitação pendente");
        }

        amizadeRepository.delete(amizade);
    }

    private List<AmizadeResponseDTO> montarRespostas(List<Amizade> amizades) {
        List<Long> usuarioIds = amizades.stream()
                .flatMap(a -> List.of(a.getSolicitanteId(), a.getDestinatarioId()).stream())
                .distinct()
                .toList();

        Map<Long, Usuario> usuariosMap = usuarioRepository.findAllById(usuarioIds).stream()
                .collect(Collectors.toMap(Usuario::getId, Function.identity()));

        return amizades.stream()
                .map(a -> {
                    Usuario solicitante = usuariosMap.get(a.getSolicitanteId());
                    Usuario destinatario = usuariosMap.get(a.getDestinatarioId());
                    return new AmizadeResponseDTO(
                            a.getId(),
                            a.getSolicitanteId(),
                            solicitante != null ? solicitante.getEmail() : null,
                            a.getDestinatarioId(),
                            destinatario != null ? destinatario.getEmail() : null,
                            a.getEstado(),
                            a.getCriadoEm(),
                            a.getAtualizadoEm()
                    );
                })
                .toList();
    }

    private AmizadeResponseDTO toResponse(Amizade amizade, Long usuarioId) {
        List<Long> usuarioIds = List.of(amizade.getSolicitanteId(), amizade.getDestinatarioId());
        Map<Long, Usuario> usuariosMap = usuarioRepository.findAllById(usuarioIds).stream()
                .collect(Collectors.toMap(Usuario::getId, Function.identity()));

        Usuario solicitante = usuariosMap.get(amizade.getSolicitanteId());
        Usuario destinatario = usuariosMap.get(amizade.getDestinatarioId());

        return new AmizadeResponseDTO(
                amizade.getId(),
                amizade.getSolicitanteId(),
                solicitante != null ? solicitante.getEmail() : null,
                amizade.getDestinatarioId(),
                destinatario != null ? destinatario.getEmail() : null,
                amizade.getEstado(),
                amizade.getCriadoEm(),
                amizade.getAtualizadoEm()
        );
    }
}
