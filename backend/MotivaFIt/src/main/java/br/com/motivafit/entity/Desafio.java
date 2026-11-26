package br.com.motivafit.entity;

import br.com.motivafit.enums.EstadoDesafio;
import br.com.motivafit.enums.Visibilidade;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "desafio")
public class Desafio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "criador_id", updatable = false)
    private Long criadorId;

    @Column(nullable = false, length = 100)
    private String titulo;

    @Column(nullable = false)
    private LocalDate prazo;

    @Column(length = 1000)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Visibilidade visibilidade = Visibilidade.PRIVADO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoDesafio estado = EstadoDesafio.ATIVO;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected Desafio() {
    }

    public Desafio(Long criadorId, String titulo, LocalDate prazo) {
        this(criadorId, titulo, prazo, null, Visibilidade.PRIVADO);
    }

    public Desafio(Long criadorId, String titulo, LocalDate prazo, String descricao, Visibilidade visibilidade) {
        this.criadorId = criadorId;
        this.titulo = titulo;
        this.prazo = prazo;
        this.descricao = descricao;
        if (visibilidade != null) {
            this.visibilidade = visibilidade;
        }
    }

    public void cancelar() {
        this.estado = EstadoDesafio.CANCELADO;
    }

    public void atualizar(String titulo, LocalDate prazo, String descricao, Visibilidade visibilidade) {
        this.titulo = titulo;
        this.prazo = prazo;
        this.descricao = descricao;
        // Visibilidade é opcional na atualização: sem valor, mantém a atual.
        if (visibilidade != null) {
            this.visibilidade = visibilidade;
        }
    }

    public Long getId() {
        return id;
    }

    public Long getCriadorId() {
        return criadorId;
    }

    public String getTitulo() {
        return titulo;
    }

    public LocalDate getPrazo() {
        return prazo;
    }

    public String getDescricao() {
        return descricao;
    }

    public Visibilidade getVisibilidade() {
        return visibilidade;
    }

    public EstadoDesafio getEstado() {
        return estado;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
