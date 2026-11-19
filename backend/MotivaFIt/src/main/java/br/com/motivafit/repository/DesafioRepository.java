package br.com.motivafit.repository;

import br.com.motivafit.entity.Desafio;
import br.com.motivafit.enums.EstadoDesafio;
import br.com.motivafit.enums.EstadoParticipante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DesafioRepository extends JpaRepository<Desafio, Long> {

    Optional<Desafio> findByIdAndEstado(Long id, EstadoDesafio estado);


    @Query("""
            SELECT d FROM Desafio d
            WHERE d.estado = :estado
              AND EXISTS (SELECT 1 FROM DesafioParticipante p
                          WHERE p.desafioId = d.id
                            AND p.usuarioId = :usuarioId
                            AND p.estado <> :recusado)
            ORDER BY d.prazo ASC, d.id ASC
            """)
    List<Desafio> findVisiveisDoUsuario(@Param("usuarioId") Long usuarioId,
                                        @Param("estado") EstadoDesafio estado,
                                        @Param("recusado") EstadoParticipante recusado);
}