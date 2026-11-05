package br.com.motivafit.service;

import br.com.motivafit.dto.request.ExercicioRequestDTO;
import br.com.motivafit.dto.response.ExercicioResponseDTO;
import br.com.motivafit.entity.CatalogoExercicio;
import br.com.motivafit.entity.Exercicio;
import br.com.motivafit.entity.Treino;
import br.com.motivafit.dto.mapper.ExercicioMapper;
import br.com.motivafit.repository.CatalogoExercicioRepository;
import br.com.motivafit.repository.ExercicioRepository;
import br.com.motivafit.repository.TreinoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExercicioService {

    private final ExercicioRepository exercicioRepository;
    private final TreinoRepository treinoRepository;
    private final CatalogoExercicioRepository catalogoExercicioRepository;
    private final ExercicioMapper exercicioMapper;

    public ExercicioService(ExercicioRepository exercicioRepository,
                            TreinoRepository treinoRepository,
                            CatalogoExercicioRepository catalogoExercicioRepository,
                            ExercicioMapper exercicioMapper) {
        this.exercicioRepository = exercicioRepository;
        this.treinoRepository = treinoRepository;
        this.catalogoExercicioRepository = catalogoExercicioRepository;
        this.exercicioMapper = exercicioMapper;
    }

    public List<ExercicioResponseDTO> listarPorTreinoId(Long treinoId) {
        List<Exercicio> exercicios = exercicioRepository.findByTreinoId(treinoId);

        return exercicios.stream()
                .map(exercicioMapper::toDto)
                .toList();
    }

    public ExercicioResponseDTO adicionarExercicio(Long treinoId, ExercicioRequestDTO dto) {
        // Vai buscar o Treino e o Catálogo à base de dados para o Mapper conseguir fazer a ligação
        Treino treino = treinoRepository.findById(treinoId)
                .orElseThrow(() -> new RuntimeException("Treino não encontrado"));

        CatalogoExercicio catalogo = catalogoExercicioRepository.findById(dto.catalogoExercicioId())
                .orElseThrow(() -> new RuntimeException("Catálogo de Exercício não encontrado"));

        // O seu Mapper já faz o setTreino e setCatalogoExercicio automaticamente!
        Exercicio novoExercicio = exercicioMapper.toEntity(dto, treino, catalogo);

        Exercicio exercicioSalvo = exercicioRepository.save(novoExercicio);

        return exercicioMapper.toDto(exercicioSalvo);
    }
}
