# MotivaFit — branch `developer`

Código em desenvolvimento do MotivaFit, aplicativo web de organização de treinos com gamificação. Esta branch reúne o back-end e o front-end antes de irem para a `main`.

**Documentação do projeto:** <https://fga0138-mds-ajax.github.io/2026.2-T03-Perlman/>

## Estrutura

| Pasta | Conteúdo |
| :-- | :-- |
| [`backend/MotivaFIt`](backend/MotivaFIt) | API REST em Java 25 e Spring Boot 4, com PostgreSQL |
| [`frontend/MotivaFit`](frontend/MotivaFit) | Aplicação web em React, TypeScript e Vite |
| [`docs`](docs) | Plano de integração entre front-end e back-end e fontes da revisão dos documentos de visão e de arquitetura. A documentação publicada fica na branch `docs`. |

## Como rodar

Pré-requisitos: Docker com Docker Compose. Para rodar sem Docker, Java 25 com Maven e Node.js 22 ou superior.

1. **Back-end** (porta 8080): crie o arquivo `.env` e suba a API e o banco, conforme o [README do back-end](backend/MotivaFIt/README.md).

    ```bash
    cd backend/MotivaFIt
    docker compose up
    ```

2. **Front-end** (porta 3000): em outro terminal, suba a aplicação, conforme o [README do front-end](frontend/MotivaFit/README.md).

    ```bash
    cd frontend/MotivaFit
    docker compose -f docker-compose.dev.yml up
    ```

3. Abra <http://localhost:3000>. O front-end encaminha as chamadas de `/api` para o back-end em `http://localhost:8080`.

| Serviço | Endereço |
| :-- | :-- |
| Aplicação web | <http://localhost:3000> |
| API | <http://localhost:8080> |
| Swagger UI | <http://localhost:8080/swagger-ui.html> |
| PostgreSQL | `localhost:5432` |

## Testes

| Onde | Comando | O que roda |
| :-- | :-- | :-- |
| `backend/MotivaFIt` | `docker compose --profile testing run --rm test` | Testes do back-end (JUnit) |
| `backend/MotivaFIt` | `mvn verify` | Testes e relatório de cobertura do JaCoCo, com mínimo de 70% das linhas |
| `frontend/MotivaFit` | `npm test` | Testes do cliente HTTP e da interface (Vitest) |
