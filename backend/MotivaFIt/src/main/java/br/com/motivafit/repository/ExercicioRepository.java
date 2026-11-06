package br.com.motivafit.repository;

import br.com.motivafit.entity.Exercicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExercicioRepository extends JpaRepository<Exercicio, Long> {
    List<Exercicio> findAllByTreinoId(Long treinoId);
    List<Exercicio> findByTreinoId(Long treinoId);
    List<Exercicio> findByTreinoIdOrderByIdAsc(Long treinoId);
    Optional<Exercicio> findByIdAndTreinoId(Long id, Long treinoId);
    boolean existsByTreinoIdAndCatalogoExercicioId(Long treinoId, Long catalogoExercicioId);
}
