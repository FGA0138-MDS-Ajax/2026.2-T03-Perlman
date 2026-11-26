package br.com.motivafit.entity;

import br.com.motivafit.enums.EstadoParticipante;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "desafio_participante")
public class DesafioParticipante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "desafio_id", nullable = false, updatable = false)
    private Long desafioId;

    @Column(name = "usuario_id", nullable = false, updatable = false)
    private Long usuarioId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoParticipante estado;

    @Column(name = "aceito_em")
    private OffsetDateTime aceitoEm;

    public DesafioParticipante() {
    }

    public Long getId() {
        return id;
    }

    public Long getDesafioId() {
        return desafioId;
    }

    public void setDesafioId(Long desafioId) {
        this.desafioId = desafioId;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public EstadoParticipante getEstado() {
        return estado;
    }

    public void setEstado(EstadoParticipante estado) {
        this.estado = estado;
    }

    public OffsetDateTime getAceitoEm() {
        return aceitoEm;
    }

    public void setAceitoEm(OffsetDateTime aceitoEm) {
        this.aceitoEm = aceitoEm;
    }
}