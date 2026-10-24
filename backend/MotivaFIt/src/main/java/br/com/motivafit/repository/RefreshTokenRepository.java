package br.com.motivafit.repository;

import br.com.motivafit.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByHash(String hash);
    List<RefreshToken> findByFamilia(String familia);
}
