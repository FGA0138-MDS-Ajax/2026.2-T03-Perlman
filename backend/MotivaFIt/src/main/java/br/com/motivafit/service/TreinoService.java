package br.com.motivafit.service;

import br.com.motivafit.dto.mapper.TreinoMapper;
import br.com.motivafit.dto.request.TreinoRequestDTO;
import br.com.motivafit.dto.response.TreinoResponseDTO;
import br.com.motivafit.entity.Treino;
import br.com.motivafit.repository.TreinoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
        return treinoRepository.findAllByUsuarioIdAndExcluidoEmIsNull(usuarioId)
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
        return treinoRepository.findByIdAndUsuarioIdAndExcluidoEmIsNull(id, usuarioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Treino não encontrado"));
    }
}