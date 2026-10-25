package br.com.motivafit.service;

import br.com.motivafit.dto.mapper.TreinoMapper;
import br.com.motivafit.dto.request.TreinoRequestDTO;
import br.com.motivafit.dto.response.TreinoResponseDTO;
import br.com.motivafit.entity.Treino;
import br.com.motivafit.enums.Visibilidade;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.repository.TreinoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class TreinoService {

    private final TreinoRepository treinoRepository;

    public TreinoService(TreinoRepository treinoRepository) {
        this.treinoRepository = treinoRepository;
    }

    @Transactional
    public TreinoResponseDTO create(Long usuarioId, TreinoRequestDTO request) {
        Treino entity = TreinoMapper.toEntity(request, usuarioId);
        return TreinoMapper.toDto(treinoRepository.saveAndFlush(entity));
    }

    @Transactional(readOnly = true)
    public List<TreinoResponseDTO> findAll(Long usuarioId) {
        return treinoRepository.findAllByUsuarioIdAndExcluidoEmIsNullOrVisibilidadeAndExcluidoEmIsNull(usuarioId, Visibilidade.PUBLICO)
                .stream()
                .map(TreinoMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public TreinoResponseDTO findById(Long usuarioId, Long id) {
        return TreinoMapper.toDto(buscarTreinoDoUsuario(usuarioId, id));
    }

    @Transactional
    public TreinoResponseDTO update(Long usuarioId, Long id, TreinoRequestDTO request) {
        Treino entity = buscarTreinoDoUsuario(usuarioId, id);
        TreinoMapper.updateEntity(entity, request);
        return TreinoMapper.toDto(treinoRepository.saveAndFlush(entity));
    }

    @Transactional
    public void delete(Long usuarioId, Long id) {
        Treino entity = buscarTreinoDoUsuario(usuarioId, id);
        entity.setExcluidoEm(OffsetDateTime.now());
        treinoRepository.save(entity);
    }

    private Treino buscarTreinoDoUsuario(Long usuarioId, Long id) {
        return treinoRepository.findByIdEUsuarioOuPublico(id, usuarioId, Visibilidade.PUBLICO)
                .orElseThrow(() -> new NaoEncontradoException(
                        "TREINO_NAO_ENCONTRADO", "Treino não encontrado"));
    }
}