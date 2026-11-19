package br.com.motivafit.repository;

import br.com.motivafit.entity.DesafioParticipante;
import br.com.motivafit.enums.EstadoParticipante;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DesafioParticipanteRepository extends JpaRepository<DesafioParticipante, Long> {

    boolean existsByDesafioIdAndUsuarioIdAndEstadoNot(Long desafioId, Long usuarioId, EstadoParticipante estado);
}
