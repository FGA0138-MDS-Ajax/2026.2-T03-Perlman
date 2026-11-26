# MotivaFit — Back-end

API REST do MotivaFit, em **Java 25** e **Spring Boot 4**, com **Spring Security** (JWT e cookies de sessão), **Flyway** e **PostgreSQL 16**.

## Configuração e execução

O [Compose único na raiz](../../compose.yaml) inicia PostgreSQL, backend,
frontend e nginx. Configure o `.env` da raiz seguindo o [guia Docker](../../DOCKER.md).

```bash
# Na raiz do repositório
docker compose up -d --build
docker compose logs -f backend
```

A API usa o banco `db:5432` na rede interna. O proxy publica a API em
`http://localhost:8080/api/`, o Swagger em `http://localhost:8080/swagger-ui.html`
e a especificação em `http://localhost:8080/v3/api-docs`.
O perfil `prod` não carrega os dados de demonstração. As migrations Flyway
criam e atualizam as tabelas. Para parar: `docker compose down`.

Para rodar sem Docker, configure `DB_URL`, `DB_USER`, `DB_PASSWORD`,
`JWT_SECRET` e `JWT_ISSUER` no ambiente e execute `mvn spring-boot:run`.
O segredo JWT deve ser Base64 com pelo menos 32 bytes
(`openssl rand -base64 32`). Configure também `CORS_ALLOWED_ORIGIN`,
`COOKIE_SECURE`, `SUPERUSUARIO_EMAIL` e `SUPERUSUARIO_SENHA` para seu ambiente.
`GOOGLE_CLIENT_ID` é opcional; `JWT_EXPIRATION_MINUTES` e
`JWT_REFRESH_EXPIRATION_DAYS` têm padrões de 15 minutos e 7 dias.

## Testes

Com Java 25, Maven e Docker instalados, execute nesta pasta:

```bash
mvn verify
```

O comando gera o relatório em `target/site/jacoco/index.html` e exige pelo
menos 70% de cobertura de linhas. Os testes com Testcontainers precisam do
Docker em execução.

## Endpoints

| Grupo | Rotas |
| :-- | :-- |
| Autenticação | `POST /api/auth/cadastro`, `/login`, `/google`, `/refresh`, `/logout` |
| Conta | `GET /api/conta/{id}`, `DELETE /api/conta/{id}` |
| Usuários | `GET` e `PUT /api/usuarios/me/preferencias`, `GET /api/usuarios/busca?email=` |
| Catálogo de exercícios | `GET /api/catalogo-exercicios`, `GET /api/catalogo-exercicios/{id}` |
| Catálogo (administração) | `POST`, `PUT /{id}` e `DELETE /{id}` em `/api/admin/catalogo-exercicios` |
| Treinos | `GET`, `POST`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}` e `POST /{id}/adicionar` em `/api/treinos` |
| Exercícios do treino | `GET`, `POST`, `PUT /{id}` e `DELETE /{id}` em `/api/treinos/{treinoId}/exercicios` |
| Registros de execução | `GET`, `POST`, `GET /{id}`, `PUT /{id}` e `DELETE /{id}` em `/api/registros` |
| Evolução pessoal | `GET /api/metricas/evolucao` |
| Amizades | `GET`, `POST`, `PATCH /{id}` e `DELETE /{id}` em `/api/amizades` |
| Desafios | `GET`, `POST`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}`, `GET /{id}/progresso`, `GET` e `POST /{id}/participantes`, `POST`, `PATCH` e `DELETE /{id}/participantes/me` em `/api/desafios` |
| Grupos | `GET`, `POST`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}`, `GET /convites`, `POST /convites/aceite`, `GET /{id}/membros`, `DELETE /{id}/membros/{usuarioId}`, `POST /{id}/convites`, `GET` e `POST /{id}/feed` em `/api/grupos` |
| Métricas administrativas | `GET` em `/api/admin/metricas/usuarios-ativos`, `/frequencia-media`, `/ranking-tempo-treino`, `/exercicios-mais-realizados`, `/rotinas` e `/retencao`. Somente valores agregados: nenhuma rota lista contas ou dados de outras pessoas |
| Convites de administrador | `POST /api/admin/convites`, `POST /api/admin/convites/aceite` |

Os detalhes de cada rota estão no Swagger UI. O guia de uso para o front-end está na [documentação do projeto](https://fga0138-mds-ajax.github.io/2026.2-T03-Perlman/produto/guia-api/).

## Estrutura do código

`src/main/java/br/com/motivafit`:

| Pacote | Conteúdo |
| :-- | :-- |
| `controller` | Rotas REST |
| `service` | Regras de negócio |
| `repository` | Acesso ao banco (Spring Data JPA) |
| `entity`, `enums` | Modelo de dados |
| `dto` | Objetos de requisição e resposta e seus mapeadores |
| `security`, `config` | Autenticação, JWT, CORS e OpenAPI |
| `exception` | Erros padronizados da API |
| `metricas` | Período e agrupamento usados nas métricas |
| `bootstrap` | Criação do superusuário e dos dados de demonstração |
