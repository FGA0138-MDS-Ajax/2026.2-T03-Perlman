package br.com.motivafit.repository;

import br.com.motivafit.entity.DesafioParticipante;
import br.com.motivafit.enums.EstadoParticipante;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DesafioParticipanteRepository extends JpaRepository<DesafioParticipante, Long> {

    boolean existsByDesafioIdAndUsuarioIdAndEstadoNot(Long desafioId, Long usuarioId, EstadoParticipante estado);

    List<DesafioParticipante> findAllByDesafioId(Long desafioId);

    Optional<DesafioParticipante> findByDesafioIdAndUsuarioId(Long desafioId, Long usuarioId);
}
