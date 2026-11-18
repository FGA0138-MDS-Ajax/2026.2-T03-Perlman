package br.com.motivafit.repository;

import br.com.motivafit.entity.ConviteAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ConviteAdminRepository extends JpaRepository<ConviteAdmin, Long> {
    Optional<ConviteAdmin> findByTokenHash(String tokenHash);

    @Query("""
            select c from ConviteAdmin c
            where lower(c.email) = lower(:email)
              and c.estado = br.com.motivafit.enums.Estado.PENDENTE
            """)
    Optional<ConviteAdmin> findPendentePorEmail(String email);

}
