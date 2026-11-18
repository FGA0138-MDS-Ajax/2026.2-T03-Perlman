package br.com.motivafit.service;

import br.com.motivafit.dto.mapper.CatalogoExercicioMapper;
import br.com.motivafit.dto.response.CatalogoExercicioResponseDTO;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.repository.CatalogoExercicioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CatalogoExercicioService {

    private final CatalogoExercicioRepository repository;

    public CatalogoExercicioService(CatalogoExercicioRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<CatalogoExercicioResponseDTO> findAll() {
        return repository.findAllByAtivoTrueOrderByNomeAsc()
                .stream()
                .map(CatalogoExercicioMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public CatalogoExercicioResponseDTO findById(Long id) {
        return repository.findByIdAndAtivoTrue(id)
                .map(CatalogoExercicioMapper::toDto)
                .orElseThrow(() -> new NaoEncontradoException(
                        "EXERCICIO_NAO_ENCONTRADO", "Exercício não encontrado"));
    }
}