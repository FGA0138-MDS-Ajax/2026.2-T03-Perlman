# MotivaFit — branch `docs`

Fontes da documentação do MotivaFit, escritas em Markdown e publicadas com o [MkDocs](https://www.mkdocs.org/) e o tema [Material](https://squidfunk.github.io/mkdocs-material/).

**Site publicado:** <https://fga0138-mds-ajax.github.io/2026.2-T03-Perlman/>

Esta branch guarda somente a documentação. O código do software está na branch `developer`.

## O que há no site

| Aba | Conteúdo | Pasta |
| :-- | :-- | :-- |
| Início | Apresentação do projeto e da equipe | `docs/index.md` |
| Gestão e Metodologia | Equipe, ciclo de vida, Sprints, comunicação, riscos, processo e atas de reunião | `docs/gestao`, `docs/atas-reuniao` |
| Arquitetura | Documento de arquitetura e guia da API | `docs/produto` |
| Produto | Visão do produto, escopo, perfis, cenários, backlog e rastreabilidade | `docs/produto` |
| Métricas | Quadro GQM, medições do GQM e medições do processo | `docs/metricas` |
| Testes | Estratégia, roteiro e relatório de testes da API | `docs/testes` |
| Referências | Fontes citadas | `docs/referencias.md` |

## Como rodar localmente

Requer Python 3.

```bash
python3 -m venv venv
source venv/bin/activate
pip install mkdocs-material
mkdocs serve
```

O site fica em <http://127.0.0.1:8000/> e recarrega a cada arquivo salvo. A pasta `venv` é ignorada pelo Git.

## Como editar

- **Alterar uma página:** edite o arquivo `.md` correspondente em `docs/`.
- **Criar uma página:** crie o `.md` em `docs/` e adicione-o à seção `nav` do `mkdocs.yml`. Páginas fora do `nav` não aparecem no menu.
- **Adicionar uma ata:** crie `docs/atas-reuniao/ata-reuniao-N.md` e inclua a linha em `Gestão e Metodologia > Atas de Reunião` no `mkdocs.yml`.
- **Imagens:** salve em `docs/assets/img/`.
- **Aparência:** as cores e os componentes do tema ficam em `docs/stylesheets/extra.css`.

Antes de enviar, rode `mkdocs build` e confira se não há avisos de links ou imagens quebrados.

## Publicação

Cada push nesta branch executa o workflow `.github/workflows/ci.yml`, que gera o site e o envia para a branch `gh-pages`. O GitHub Pages publica a partir dela em poucos minutos.

```bash
git add .
git commit -m "docs: descrição da alteração"
git push origin docs
```

A branch `gh-pages` é reescrita a cada publicação e não deve ser editada à mão. O andamento aparece na aba **Actions** do repositório.

## Outros arquivos

`docs/produto` também guarda os fontes em LaTeX (`sections/`, `header.tex`, `compilar.sh`) e os PDFs das versões do documento de visão.
