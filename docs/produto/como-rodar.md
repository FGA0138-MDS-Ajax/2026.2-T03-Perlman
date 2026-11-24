# Como Rodar o Projeto

O código do MotivaFit fica na branch [`developer`](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Perlman/tree/developer) e tem duas partes: o back-end (`backend/MotivaFIt`), uma API REST em Java 25 e Spring Boot 4 com PostgreSQL, e o front-end (`frontend/MotivaFit`), uma aplicação web em React, TypeScript e Vite.

Os detalhes de cada parte estão nos READMEs do [back-end](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Perlman/blob/developer/backend/MotivaFIt/README.md) e do [front-end](https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Perlman/blob/developer/frontend/MotivaFit/README.md).

## Pré-requisitos

- Git;
- Docker com Docker Compose;
- Node.js 22 ou superior, apenas para rodar o front-end sem Docker.

## 1. Obter o código

```bash
git clone https://github.com/FGA0138-MDS-Ajax/2026.2-T03-Perlman.git
cd 2026.2-T03-Perlman
git switch developer
```

## 2. Configurar o back-end

Crie o arquivo `backend/MotivaFIt/.env`. Ele é ignorado pelo Git e não deve ser enviado ao repositório.

```env
DB_USER=
DB_PASSWORD=
DB_DATABASE=
DB_URL_CONTEINER=

JWT_SECRET=
JWT_ISSUER=
JWT_EXPIRATION_MINUTES=
JWT_REFRESH_EXPIRATION_DAYS=
```

| Variável | Para que serve |
| :-- | :-- |
| `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` | Usuário, senha e nome do banco criado pelo contêiner do PostgreSQL |
| `DB_URL_CONTEINER` | URL JDBC do banco usada pela API dentro do Docker. No Compose, o serviço do PostgreSQL se chama `db` e usa a porta 5432 |
| `JWT_SECRET`, `JWT_ISSUER` | Chave de assinatura e emissor dos tokens. A chave deve estar em **Base64** e ter pelo menos 32 bytes depois de decodificada; gere com `openssl rand -base64 48`. Com uma chave inválida, a API não inicia e informa o motivo |
| `JWT_EXPIRATION_MINUTES` | Validade do token de acesso, em minutos |
| `JWT_REFRESH_EXPIRATION_DAYS` | Validade do refresh token, em dias |

Variáveis opcionais:

| Variável | Para que serve | Padrão |
| :-- | :-- | :-- |
| `CORS_ALLOWED_ORIGIN` | Origem do front-end aceita pela API | `http://localhost:3000` |
| `COOKIE_SECURE` | Envio dos cookies somente por HTTPS | `false` |
| `SUPERUSUARIO_EMAIL`, `SUPERUSUARIO_SENHA` | Conta de superusuário criada na inicialização | Definido no `docker-compose.yml` |
| `GOOGLE_CLIENT_ID` | ID do cliente OAuth do Google, usado pelo login com Google | Vazio |

No front-end, o login com Google também precisa de `VITE_GOOGLE_CLIENT_ID` (o mesmo valor de `GOOGLE_CLIENT_ID`), definida no `.env.local` ou passada no build do Docker. Sem ela, o botão "Entrar com Google" não aparece.

## 3. Subir o back-end

```bash
cd backend/MotivaFIt
docker compose up
```

O comando sobe o PostgreSQL (porta 5432) e a API (porta 8080). As tabelas são criadas pelas migrations do Flyway.

O Docker Compose ativa o perfil `dev`, que cria um superusuário e usuários de teste com treinos e registros. As credenciais padrão estão em `DadosDemonstracaoBootstrap.java` e servem apenas para o ambiente local.

## 4. Subir o front-end

Em outro terminal, a partir da raiz do projeto:

```bash
cd frontend/MotivaFit
docker compose -f docker-compose.dev.yml up
```

Sem Docker, com Node.js 22 ou superior:

```bash
cd frontend/MotivaFit
npm install
npm run dev
```

O front-end encaminha as chamadas de `/api` para o back-end em `http://localhost:8080`.

## 5. Acessar

| Serviço | Endereço |
| :-- | :-- |
| Aplicação web | <http://localhost:3000> |
| API | <http://localhost:8080> |
| Swagger UI | <http://localhost:8080/swagger-ui.html> |
| Especificação OpenAPI | <http://localhost:8080/v3/api-docs> |

## Testes

| Onde | Comando | O que roda |
| :-- | :-- | :-- |
| `backend/MotivaFIt` | `docker compose --profile testing run --rm test` | Testes do back-end (JUnit) |
| `backend/MotivaFIt` | `mvn verify` | Testes e relatório de cobertura do JaCoCo, com mínimo de 70% das linhas. Requer Java 25, Maven e Docker |
| `frontend/MotivaFit` | `npm test` | Testes do cliente HTTP (Node 22.18+ ou 24) e da interface (Vitest). Em máquinas com pouca memória, use `npx vitest run --maxWorkers=2` |

## Parar

- **Front-end:** `Ctrl + C` no terminal ou, com Docker, `docker compose -f docker-compose.dev.yml down`.
- **Back-end:** `Ctrl + C` e depois `docker compose down`. Para apagar também os dados do banco: `docker compose down -v`.
