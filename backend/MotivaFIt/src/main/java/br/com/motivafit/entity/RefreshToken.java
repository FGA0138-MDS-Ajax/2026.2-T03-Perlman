package br.com.motivafit.entity;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.Date;
import java.util.Objects;

@Entity
@Table(name = "refresh_token")
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @Column(nullable = false, unique = true)
    private String hash;

    @Column(nullable = false)
    private String familia;

    @JoinColumn(name = "usuario_id", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Usuario usuarioId;

    @Column(nullable = false)
    private Date validade;

    private OffsetDateTime revogacao;

    public RefreshToken(){}

    public Long getId() {
        return id;
    }

    public String getHash() {
        return hash;
    }

    public void setHash(String hash) {
        this.hash = hash;
    }

    public String getFamilia() {
        return familia;
    }

    public void setFamilia(String familia) {
        this.familia = familia;
    }

    public Usuario getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Usuario usuarioId) {
        this.usuarioId = usuarioId;
    }

    public Date getValidade() {
        return validade;
    }

    public void setValidade(Date validade) {
        this.validade = validade;
    }

    public OffsetDateTime getRevogacao() {
        return revogacao;
    }

    public void setRevogacao(OffsetDateTime revogacao) {
        this.revogacao = revogacao;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        RefreshToken that = (RefreshToken) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "RefreshToken{" +
                "id=" + id +
                ", hash='" + hash + '\'' +
                ", familia='" + familia + '\'' +
                ", usuarioId=" + usuarioId +
                ", validade=" + validade +
                ", revogacao=" + revogacao +
                '}';
    }
}
