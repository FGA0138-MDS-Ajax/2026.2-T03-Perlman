package br.com.motivafit.repository;

import br.com.motivafit.entity.RegistroDiario;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegistroDiarioRepository extends JpaRepository<RegistroDiario, Long> {

    Optional<RegistroDiario> findByUsuarioIdAndChaveIdempotencia(Long usuarioId, String chaveIdempotencia);

    List<RegistroDiario> findAllByUsuarioIdOrderByExecutadoEmDesc(Long usuarioId, Pageable pageable);
}