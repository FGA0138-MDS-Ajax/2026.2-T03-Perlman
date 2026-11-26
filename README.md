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

Na raiz, copie `.env.production.example` para `.env` e preencha as variáveis
conforme o [guia Docker](DOCKER.md). Para HTTP local, use
`CORS_ALLOWED_ORIGIN=http://localhost:8080` e `COOKIE_SECURE=false`.

```bash
docker compose up -d --build
```

O Compose inicia PostgreSQL → backend → frontend → nginx com `depends_on`.
A aplicação fica em <http://localhost:8080> e o Swagger em
<http://localhost:8080/swagger-ui.html>. O banco mantém os dados em volume.

## Testes

| Onde | Comando | O que roda |
| :-- | :-- | :-- |
| `backend/MotivaFIt` | `mvn verify` | Testes e relatório de cobertura do JaCoCo, com mínimo de 70% das linhas |
| `frontend/MotivaFit` | `npm test` | Testes do cliente HTTP e da interface (Vitest) |
