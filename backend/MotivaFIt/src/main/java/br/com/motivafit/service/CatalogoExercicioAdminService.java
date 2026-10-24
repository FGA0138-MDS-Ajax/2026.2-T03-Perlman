package br.com.motivafit.service;

import br.com.motivafit.dto.mapper.CatalogoExercicioMapper;
import br.com.motivafit.dto.request.CatalogoExercicioRequestDTO;
import br.com.motivafit.dto.response.CatalogoExercicioResponseDTO;
import br.com.motivafit.entity.CatalogoExercicio;
import br.com.motivafit.exception.ConflitoException;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.repository.CatalogoExercicioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CatalogoExercicioAdminService {

    private final CatalogoExercicioRepository repository;

    public CatalogoExercicioAdminService(CatalogoExercicioRepository repository) {
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
                .orElseThrow(() -> new NaoEncontradoException(
                        "EXERCICIO_NAO_ENCONTRADO", "Exercício não encontrado"));
    }

    private ConflitoException nomeJaExiste() {
        return new ConflitoException(
                "EXERCICIO_JA_CADASTRADO", "Já existe um exercício com esse nome");
    }
}