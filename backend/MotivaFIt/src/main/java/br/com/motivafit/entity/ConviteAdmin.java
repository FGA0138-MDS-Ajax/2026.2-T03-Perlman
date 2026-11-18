package br.com.motivafit.entity;

import br.com.motivafit.enums.Estado;
import br.com.motivafit.exception.ConflitoException;
import br.com.motivafit.exception.RequisicaoInvalidaException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "convite_admin")
public class ConviteAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "convidador_id", nullable = false)
    private Usuario convidador;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "token_hash", nullable = false, unique = true)
    private String tokenHash;

    @Column(name = "expira_em", nullable = false)
    private Instant expiraEm;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private Estado estado = Estado.PENDENTE;

    public ConviteAdmin() {
    }

    public boolean estaPendente() {
        return estado == Estado.PENDENTE;
    }

    public boolean expirou(Instant agora) {
        return !agora.isBefore(expiraEm);
    }

    public void aceitar(String emailInformado, Instant agora) {
        if (!estaPendente()) {
            throw new ConflitoException("CONVITE_NAO_PENDENTE", "Convite não está pendente.");
        }
        if (expirou(agora)) {
            this.estado = Estado.EXPIRADO;
            throw new ConflitoException("CONVITE_EXPIRADO", "Convite expirado.");
        }
        if (!email.equalsIgnoreCase(emailInformado)) {
            throw new RequisicaoInvalidaException("EMAIL_NAO_CORRESPONDE_CONVITE", "E-mail não corresponde ao convite.");
        }
        this.estado = Estado.ACEITO;
    }

    public void expirar() {
        if (estaPendente()) {
            this.estado = Estado.EXPIRADO;
        }
    }


    public Long getId() {
        return id;
    }

    public Usuario getConvidador() {
        return convidador;
    }

    public void setConvidador(Usuario convidador) {
        this.convidador = convidador;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }

    public Instant getExpiraEm() {
        return expiraEm;
    }

    public void setExpiraEm(Instant expiraEm) {
        this.expiraEm = expiraEm;
    }

    public Estado getEstado() {
        return estado;
    }

    public void setEstado(Estado estado) {
        this.estado = estado;
    }
}
