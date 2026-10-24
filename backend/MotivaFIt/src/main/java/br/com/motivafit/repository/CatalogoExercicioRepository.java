package br.com.motivafit.repository;

import br.com.motivafit.entity.CatalogoExercicio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CatalogoExercicioRepository extends JpaRepository<CatalogoExercicio, Long> {

    List<CatalogoExercicio> findAllByAtivoTrueOrderByNomeAsc();

    Optional<CatalogoExercicio> findByIdAndAtivoTrue(Long id);

    boolean existsByNomeIgnoreCase(String nome);

    boolean existsByNomeIgnoreCaseAndIdNot(String nome, Long id);
}
