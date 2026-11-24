package br.com.motivafit.repository;

import br.com.motivafit.entity.RegistroDiario;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface RegistroDiarioRepository extends JpaRepository<RegistroDiario, Long> {

    Optional<RegistroDiario> findByUsuarioIdAndChaveIdempotencia(Long usuarioId, String chaveIdempotencia);

    List<RegistroDiario> findAllByUsuarioIdOrderByExecutadoEmDesc(Long usuarioId, Pageable pageable);

    Optional<RegistroDiario> findByIdAndUsuarioId(Long id, Long usuarioId);

    /**
     * Soma, por usuário e exercício, o que foi registrado no intervalo [inicio, fim):
     * carga máxima, repetições totais (repetições × séries), séries, tempo e distância.
     */
    @Query("""
            SELECT r.usuarioId, r.catalogoId, MAX(r.cargaKg),
                   SUM(COALESCE(r.repeticoes, 0) * COALESCE(r.series, 1)),
                   SUM(COALESCE(r.series, 0)), SUM(COALESCE(r.tempoS, 0)), SUM(COALESCE(r.distanciaM, 0))
            FROM RegistroDiario r
            WHERE r.usuarioId IN :usuarioIds
              AND r.catalogoId IN :catalogoIds
              AND r.executadoEm >= :inicio
              AND r.executadoEm < :fim
            GROUP BY r.usuarioId, r.catalogoId
            """)
    List<Object[]> somarPorUsuarioECatalogo(@Param("usuarioIds") Collection<Long> usuarioIds,
                                            @Param("catalogoIds") Collection<Long> catalogoIds,
                                            @Param("inicio") OffsetDateTime inicio,
                                            @Param("fim") OffsetDateTime fim);
}
