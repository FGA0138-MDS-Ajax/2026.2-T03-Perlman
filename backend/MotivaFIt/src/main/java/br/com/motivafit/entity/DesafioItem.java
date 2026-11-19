package br.com.motivafit.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "desafio_item")
public class DesafioItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "desafio_id", nullable = false, updatable = false)
    private Long desafioId;

    @Column(name = "catalogo_id", nullable = false, updatable = false)
    private Long catalogoId;

    @Column(name = "meta_carga_kg", precision = 8, scale = 2)
    private BigDecimal metaCargaKg;

    @Column(name = "meta_repeticoes")
    private Integer metaRepeticoes;

    @Column(name = "meta_series")
    private Integer metaSeries;

    @Column(name = "meta_tempo_s")
    private Integer metaTempoS;

    @Column(name = "meta_distancia_m", precision = 10, scale = 2)
    private BigDecimal metaDistanciaM;

    public DesafioItem() {
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

    public Long getCatalogoId() {
        return catalogoId;
    }

    public void setCatalogoId(Long catalogoId) {
        this.catalogoId = catalogoId;
    }

    public BigDecimal getMetaCargaKg() {
        return metaCargaKg;
    }

    public void setMetaCargaKg(BigDecimal metaCargaKg) {
        this.metaCargaKg = metaCargaKg;
    }

    public Integer getMetaRepeticoes() {
        return metaRepeticoes;
    }

    public void setMetaRepeticoes(Integer metaRepeticoes) {
        this.metaRepeticoes = metaRepeticoes;
    }

    public Integer getMetaSeries() {
        return metaSeries;
    }

    public void setMetaSeries(Integer metaSeries) {
        this.metaSeries = metaSeries;
    }

    public Integer getMetaTempoS() {
        return metaTempoS;
    }

    public void setMetaTempoS(Integer metaTempoS) {
        this.metaTempoS = metaTempoS;
    }

    public BigDecimal getMetaDistanciaM() {
        return metaDistanciaM;
    }

    public void setMetaDistanciaM(BigDecimal metaDistanciaM) {
        this.metaDistanciaM = metaDistanciaM;
    }
}