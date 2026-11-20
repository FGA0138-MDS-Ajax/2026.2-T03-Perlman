package br.com.motivafit.entity;

import br.com.motivafit.enums.EstadoConviteGrupo;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "convite_grupo")
public class ConviteGrupo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "grupo_id", nullable = false)
    private Long grupoId;
    @Column(name = "convidante_id", nullable = false)
    private Long convidanteId;
    @Column(name = "convidado_id", nullable = false)
    private Long convidadoId;
    @Column(nullable = false, unique = true)
    private String token;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoConviteGrupo estado;
    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;
    @Column(name = "expira_em", nullable = false)
    private OffsetDateTime expiraEm;

    public ConviteGrupo() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getGrupoId() { return grupoId; }
    public void setGrupoId(Long grupoId) { this.grupoId = grupoId; }
    public Long getConvidanteId() { return convidanteId; }
    public void setConvidanteId(Long convidanteId) { this.convidanteId = convidanteId; }
    public Long getConvidadoId() { return convidadoId; }
    public void setConvidadoId(Long convidadoId) { this.convidadoId = convidadoId; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public EstadoConviteGrupo getEstado() { return estado; }
    public void setEstado(EstadoConviteGrupo estado) { this.estado = estado; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; }
    public OffsetDateTime getExpiraEm() { return expiraEm; }
    public void setExpiraEm(OffsetDateTime expiraEm) { this.expiraEm = expiraEm; }
}
