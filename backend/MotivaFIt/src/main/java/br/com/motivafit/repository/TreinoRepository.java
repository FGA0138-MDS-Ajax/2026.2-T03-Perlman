package br.com.motivafit.repository;

import br.com.motivafit.entity.Treino;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TreinoRepository extends JpaRepository<Treino, Long> {

    List<Treino> findAllByUsuarioIdAndExcluidoEmIsNull(Long usuarioId);

    Optional<Treino> findByIdAndUsuarioIdAndExcluidoEmIsNull(Long id, Long usuarioId);
}
