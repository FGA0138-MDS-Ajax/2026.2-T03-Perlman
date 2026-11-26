package br.com.motivafit.repository;

import br.com.motivafit.entity.GrupoFeedPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GrupoFeedPostRepository extends JpaRepository<GrupoFeedPost, Long> {
    List<GrupoFeedPost> findByGrupoIdOrderByCriadoEmDesc(Long grupoId);
}
