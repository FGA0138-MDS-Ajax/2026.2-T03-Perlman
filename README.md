# MotivaFit

Aplicativo web para praticantes de exercícios físicos que buscam organização e constância. O MotivaFit simplifica a montagem de treinos e usa gamificação, com conquistas e recompensas, para dar visibilidade à evolução do usuário e combater a desmotivação.

Projeto do **Grupo Perlman — T03**, da disciplina de Métodos de Desenvolvimento de Software (MDS), Universidade de Brasília, 2026.2, com o professor Ricardo Ajax.

**Documentação:** <https://fga0138-mds-ajax.github.io/2026.2-T03-Perlman/>

## Branches

| Branch | Para que serve |
| :-- | :-- |
| `main` | Versão de produção do software. Ainda não recebeu código: o desenvolvimento está na `developer`. |
| [`developer`](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Perlman/tree/developer) | Código em desenvolvimento: back-end (`backend/MotivaFIt`) e front-end (`frontend/MotivaFit`). |
| [`docs`](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Perlman/tree/docs) | Fontes da documentação em Markdown (MkDocs). Cada push publica o site. |
| `gh-pages` | Site gerado automaticamente a partir da `docs`. Não deve ser editada à mão. |

Para rodar o software, siga o README da branch `developer`. Para editar a documentação, siga o README da branch `docs`.

## Tecnologias

| Camada | Tecnologias |
| :-- | :-- |
| Back-end | Java 25, Spring Boot 4, Spring Security com JWT, Flyway, PostgreSQL 16 |
| Front-end | React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Testes | JUnit e JaCoCo (back-end), Vitest e Testing Library (front-end) |
| Infraestrutura | Docker Compose, GitHub Actions (publicação da documentação), GitHub Pages |
| Documentação | MkDocs com o tema Material |

## Equipe

| Integrante | Função | GitHub |
| :-- | :-- | :-- |
| Mateus Fernandes Dantas | Front-end (líder) | [@teuszindls](https://github.com/teuszindls) |
| Bernardo Campos Caxito Silveira | GQM / Analista de Qualidade | [@bernardoccs1](https://github.com/bernardoccs1) |
| Bruno Cruvinel Barros da Silva | Documentação | [@brunocruvinell](https://github.com/brunocruvinell) |
| Lucas Venâncio Pereira | Back-end | [@LucasVP2007](https://github.com/LucasVP2007) |
| Luís Felipe Pontes Vieira Andrade | Back-end | [@andradluis](https://github.com/andradluis) |
| Matheus Estevam Ferreira | Back-end | [@TheuxZn16](https://github.com/TheuxZn16) |
| Rafael Souto Lopes Laube | Front-end | [@laube-developer](https://github.com/laube-developer) |

Dono do Produto: monitor Daniel. Cliente: professor Ricardo Ajax.
