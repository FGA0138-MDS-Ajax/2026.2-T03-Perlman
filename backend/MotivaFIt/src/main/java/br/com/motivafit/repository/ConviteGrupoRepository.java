package br.com.motivafit.repository;

import br.com.motivafit.entity.ConviteGrupo;
import br.com.motivafit.enums.EstadoConviteGrupo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConviteGrupoRepository extends JpaRepository<ConviteGrupo, Long> {
    Optional<ConviteGrupo> findByToken(String token);
    boolean existsByGrupoIdAndConvidadoIdAndEstado(Long grupoId, Long convidadoId, EstadoConviteGrupo estado);
}
