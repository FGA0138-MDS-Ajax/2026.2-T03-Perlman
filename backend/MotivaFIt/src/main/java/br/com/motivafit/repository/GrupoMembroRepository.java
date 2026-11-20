package br.com.motivafit.repository;

import br.com.motivafit.entity.GrupoMembro;
import br.com.motivafit.enums.PapelGrupo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GrupoMembroRepository extends JpaRepository<GrupoMembro, Long> {
    Optional<GrupoMembro> findByGrupoIdAndUsuarioId(Long grupoId, Long usuarioId);
    List<GrupoMembro> findByGrupoIdOrderByEntradaEmAsc(Long grupoId);
    List<GrupoMembro> findByUsuarioIdOrderByEntradaEmDesc(Long usuarioId);
    long countByGrupoIdAndPapel(Long grupoId, PapelGrupo papel);
    boolean existsByGrupoIdAndUsuarioId(Long grupoId, Long usuarioId);
}
