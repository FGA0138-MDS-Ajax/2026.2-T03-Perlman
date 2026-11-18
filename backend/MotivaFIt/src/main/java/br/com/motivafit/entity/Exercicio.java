package br.com.motivafit.entity;

import jakarta.persistence.*;
import java.util.Objects;
@Entity
@Table(name = "exercicio")
public class Exercicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "treino_id", insertable = false, updatable = false)
    private Long treinoId;

    @Column(nullable = false)
    private String meta;

    @Column(name = "meta_recorde")
    private String metaRecorde;

    @ManyToOne(optional = false)
    @JoinColumn(name = "treino_id", nullable = false)
    private Treino treino;

    @ManyToOne(optional = false)
    @JoinColumn(name = "catalogo_exercicio_id", nullable = false)
    private CatalogoExercicio catalogoExercicio;

    public Exercicio() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTreinoId() { return treinoId; }
    public void setTreinoId(Long treinoId) { this.treinoId = treinoId; }

    public String getMeta() { return meta; }
    public void setMeta(String meta) { this.meta = meta; }

    public String getMetaRecorde() { return metaRecorde; }
    public void setMetaRecorde(String metaRecorde) { this.metaRecorde = metaRecorde; }

    public Treino getTreino() { return treino; }
    public void setTreino(Treino treino) { this.treino = treino; }

    public CatalogoExercicio getCatalogoExercicio() { return catalogoExercicio; }
    public void setCatalogoExercicio(CatalogoExercicio catalogoExercicio) { this.catalogoExercicio = catalogoExercicio; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Exercicio exercicio = (Exercicio) o;
        return Objects.equals(id, exercicio.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
