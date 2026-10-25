package br.com.motivafit.repository;

import br.com.motivafit.entity.Treino;
import br.com.motivafit.enums.Visibilidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface TreinoRepository extends JpaRepository<Treino, Long> {

    List<Treino> findAllByUsuarioIdAndExcluidoEmIsNullOrVisibilidadeAndExcluidoEmIsNull(Long usuarioId, Visibilidade visibilidade);

    @Query("SELECT t FROM Treino t WHERE t.id = :id AND (t.usuarioId = :usuarioId OR t.visibilidade = :visibilidade) AND t.excluidoEm IS NULL")
    Optional<Treino> findByIdEUsuarioOuPublico(
            @Param("id") Long id,
            @Param("usuarioId") Long usuarioId,
            @Param("visibilidade") Visibilidade visibilidade
    );
}
