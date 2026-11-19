package br.com.motivafit.entity;

import br.com.motivafit.enums.EstadoDesafio;
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

    // Último dia do desafio (inclusive), no fuso America/Sao_Paulo.
    @Column(nullable = false)
    private LocalDate prazo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoDesafio estado = EstadoDesafio.ATIVO;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    // Só o Hibernate usa este construtor, por isso protected.
    protected Desafio() {
    }

    public Desafio(Long criadorId, String titulo, LocalDate prazo) {
        this.criadorId = criadorId;
        this.titulo = titulo;
        this.prazo = prazo;
    }

    public void cancelar() {
        this.estado = EstadoDesafio.CANCELADO;
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

    public EstadoDesafio getEstado() {
        return estado;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}