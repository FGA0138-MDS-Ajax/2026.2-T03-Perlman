package br.com.motivafit.entity;

import br.com.motivafit.enums.PapelGrupo;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "grupo_membro")
public class GrupoMembro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "grupo_id", nullable = false)
    private Long grupoId;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PapelGrupo papel;

    @CreationTimestamp
    @Column(name = "entrada_em", nullable = false, updatable = false)
    private OffsetDateTime entradaEm;

    public GrupoMembro() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getGrupoId() { return grupoId; }
    public void setGrupoId(Long grupoId) { this.grupoId = grupoId; }
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public PapelGrupo getPapel() { return papel; }
    public void setPapel(PapelGrupo papel) { this.papel = papel; }
    public OffsetDateTime getEntradaEm() { return entradaEm; }
    public void setEntradaEm(OffsetDateTime entradaEm) { this.entradaEm = entradaEm; }
}
