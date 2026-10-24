package br.com.motivafit.service;

import br.com.motivafit.dto.mapper.CatalogoExercicioMapper;
import br.com.motivafit.dto.request.CatalogoExercicioRequestDTO;
import br.com.motivafit.dto.response.CatalogoExercicioResponseDTO;
import br.com.motivafit.entity.CatalogoExercicio;
import br.com.motivafit.repository.CatalogoExercicioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class CatalogoExercicioService {

    private final CatalogoExercicioRepository repository;

    public CatalogoExercicioService(CatalogoExercicioRepository repository) {
        this.repository = repository;
    }

    public CatalogoExercicioResponseDTO create(CatalogoExercicioRequestDTO request) {
        if (repository.existsByNomeIgnoreCase(request.nome().trim())) {
            throw nomeJaExiste();
        }
        CatalogoExercicio entity = CatalogoExercicioMapper.toEntity(request);
        return CatalogoExercicioMapper.toDto(repository.save(entity));
    }

    public CatalogoExercicioResponseDTO update(Long id, CatalogoExercicioRequestDTO request) {
        CatalogoExercicio entity = buscar(id);
        if (repository.existsByNomeIgnoreCaseAndIdNot(request.nome().trim(), id)) {
            throw nomeJaExiste();
        }
        CatalogoExercicioMapper.updateEntity(entity, request);
        return CatalogoExercicioMapper.toDto(repository.save(entity));
    }

    public void deactivate(Long id) {
        CatalogoExercicio entity = buscar(id);
        entity.desativar();
        repository.save(entity);
    }

    private CatalogoExercicio buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Exercício não encontrado"));
    }

    private ResponseStatusException nomeJaExiste() {
        return new ResponseStatusException(
                HttpStatus.CONFLICT, "Já existe um exercício com esse nome");
    }
}