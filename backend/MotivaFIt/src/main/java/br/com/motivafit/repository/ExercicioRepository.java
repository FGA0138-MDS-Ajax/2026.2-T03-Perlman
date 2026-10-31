package br.com.motivafit.repository;

import br.com.motivafit.entity.Exercicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExercicioRepository extends JpaRepository<Exercicio, Long> {
    List<Exercicio> findAllByTreinoId(Long treinoId);
    List<Exercicio> findByTreinoId(Long treinoId);
}