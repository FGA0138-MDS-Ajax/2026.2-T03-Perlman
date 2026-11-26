package br.com.motivafit.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "registro_diario")
public class RegistroDiario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false, updatable = false)
    private Long usuarioId;

    @Column(name = "catalogo_id", nullable = false, updatable = false)
    private Long catalogoId;

    @Column(name = "treino_id")
    private Long treinoId;

    @Column(name = "exercicio_id")
    private Long exercicioId;

    @Column(name = "treino_nome", length = 150)
    private String treinoNome;

    @Column(name = "exercicio_nome", nullable = false, length = 100)
    private String exercicioNome;

    @Column(name = "carga_kg", precision = 8, scale = 2)
    private BigDecimal cargaKg;

    private Integer repeticoes;

    private Integer series;

    @Column(name = "tempo_s")
    private Integer tempoS;

    @Column(name = "distancia_m", precision = 10, scale = 2)
    private BigDecimal distanciaM;

    @Column(name = "executado_em", nullable = false)
    private OffsetDateTime executadoEm;

    @Column(name = "chave_idempotencia", length = 100, updatable = false)
    private String chaveIdempotencia;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public RegistroDiario() {
    }

    public Long getId() {
        return id;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public Long getCatalogoId() {
        return catalogoId;
    }

    public void setCatalogoId(Long catalogoId) {
        this.catalogoId = catalogoId;
    }

    public Long getTreinoId() {
        return treinoId;
    }

    public void setTreinoId(Long treinoId) {
        this.treinoId = treinoId;
    }

    public Long getExercicioId() {
        return exercicioId;
    }

    public void setExercicioId(Long exercicioId) {
        this.exercicioId = exercicioId;
    }

    public String getTreinoNome() {
        return treinoNome;
    }

    public void setTreinoNome(String treinoNome) {
        this.treinoNome = treinoNome;
    }

    public String getExercicioNome() {
        return exercicioNome;
    }

    public void setExercicioNome(String exercicioNome) {
        this.exercicioNome = exercicioNome;
    }

    public BigDecimal getCargaKg() {
        return cargaKg;
    }

    public void setCargaKg(BigDecimal cargaKg) {
        this.cargaKg = cargaKg;
    }

    public Integer getRepeticoes() {
        return repeticoes;
    }

    public void setRepeticoes(Integer repeticoes) {
        this.repeticoes = repeticoes;
    }

    public Integer getSeries() {
        return series;
    }

    public void setSeries(Integer series) {
        this.series = series;
    }

    public Integer getTempoS() {
        return tempoS;
    }

    public void setTempoS(Integer tempoS) {
        this.tempoS = tempoS;
    }

    public BigDecimal getDistanciaM() {
        return distanciaM;
    }

    public void setDistanciaM(BigDecimal distanciaM) {
        this.distanciaM = distanciaM;
    }

    public OffsetDateTime getExecutadoEm() {
        return executadoEm;
    }

    public void setExecutadoEm(OffsetDateTime executadoEm) {
        this.executadoEm = executadoEm;
    }

    public String getChaveIdempotencia() {
        return chaveIdempotencia;
    }

    public void setChaveIdempotencia(String chaveIdempotencia) {
        this.chaveIdempotencia = chaveIdempotencia;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}