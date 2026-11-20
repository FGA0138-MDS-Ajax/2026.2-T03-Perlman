package br.com.motivafit.repository;

import br.com.motivafit.entity.Amizade;
import br.com.motivafit.enums.EstadoAmizade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AmizadeRepository extends JpaRepository<Amizade, Long> {

    @Query("""
            SELECT a FROM Amizade a
            WHERE (a.solicitanteId = :usuarioId OR a.destinatarioId = :usuarioId)
              AND a.estado = :estado
            ORDER BY a.criadoEm DESC
            """)
    List<Amizade> findByUsuarioAndEstado(@Param("usuarioId") Long usuarioId,
                                          @Param("estado") EstadoAmizade estado);

    @Query("""
            SELECT a FROM Amizade a
            WHERE (a.solicitanteId = :usuarioId OR a.destinatarioId = :usuarioId)
              AND a.estado <> :recusada
            ORDER BY a.criadoEm DESC
            """)
    List<Amizade> findAtivasDoUsuario(@Param("usuarioId") Long usuarioId,
                                       @Param("recusada") EstadoAmizade recusada);

    @Query("""
            SELECT a FROM Amizade a
            WHERE a.id = :id
              AND (a.solicitanteId = :usuarioId OR a.destinatarioId = :usuarioId)
              AND a.estado <> :recusada
            """)
    Optional<Amizade> findByIdAndUsuario(@Param("id") Long id,
                                          @Param("usuarioId") Long usuarioId,
                                          @Param("recusada") EstadoAmizade recusada);

    Optional<Amizade> findBySolicitanteIdAndDestinatarioId(Long solicitanteId, Long destinatarioId);

    @Query("""
            SELECT a FROM Amizade a
            WHERE a.solicitanteId = :solicitanteId
              AND a.destinatarioId = :destinatarioId
              OR a.solicitanteId = :destinatarioId
              AND a.destinatarioId = :solicitanteId
            """)
    List<Amizade> findEntreUsuarios(@Param("solicitanteId") Long solicitanteId,
                                     @Param("destinatarioId") Long destinatarioId);
}
