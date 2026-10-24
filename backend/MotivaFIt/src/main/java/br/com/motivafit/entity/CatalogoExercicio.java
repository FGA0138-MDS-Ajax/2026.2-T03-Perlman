package br.com.motivafit.entity;

import br.com.motivafit.enums.Modalidade;
import jakarta.persistence.*;

@Entity
@Table(name = "catalogo_exercicio")
public class CatalogoExercicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Modalidade modalidade;

    @Column(name = "grupo_muscular", nullable = false, length = 50)
    private String grupoMuscular;

    @Column(nullable = false)
    private Boolean ativo = true;

    protected CatalogoExercicio() {
    }

    public CatalogoExercicio(String nome, Modalidade modalidade, String grupoMuscular) {
        this.nome = nome;
        this.modalidade = modalidade;
        this.grupoMuscular = grupoMuscular;
    }

    public void atualizar(String nome, Modalidade modalidade, String grupoMuscular) {
        this.nome = nome;
        this.modalidade = modalidade;
        this.grupoMuscular = grupoMuscular;
    }

    public void desativar() {
        this.ativo = false;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public Modalidade getModalidade() {
        return modalidade;
    }

    public String getGrupoMuscular() {
        return grupoMuscular;
    }

    public Boolean getAtivo() {
        return ativo;
    }
}