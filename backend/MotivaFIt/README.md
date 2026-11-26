# MotivaFit — Back-end

API REST do MotivaFit, em **Java 25** e **Spring Boot 4**, com **Spring Security** (JWT e cookies de sessão), **Flyway** e **PostgreSQL 16**.

## Configuração

Crie um arquivo `.env` nesta pasta. Ele é ignorado pelo Git e não deve ser enviado ao repositório.

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

Variáveis sem valor padrão no `docker-compose.yml`, que precisam estar no `.env`:

| Variável | Para que serve |
| :-- | :-- |
| `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` | Usuário, senha e nome do banco criado pelo contêiner do PostgreSQL |
| `DB_URL_CONTEINER` | URL JDBC do banco usada pela API dentro do Docker. No Compose, o serviço do PostgreSQL se chama `db` e usa a porta 5432 |
| `JWT_SECRET`, `JWT_ISSUER` | Chave de assinatura (em **Base64**, com pelo menos 32 bytes; gere com `openssl rand -base64 48`) e emissor dos tokens. Uma chave inválida impede a aplicação de iniciar, com a mensagem de como gerá-la |
| `JWT_EXPIRATION_MINUTES` | Validade do token de acesso, em minutos |
| `JWT_REFRESH_EXPIRATION_DAYS` | Validade do refresh token, em dias |

Variáveis opcionais, com valor padrão no `docker-compose.yml`:

| Variável | Para que serve | Padrão |
| :-- | :-- | :-- |
| `CORS_ALLOWED_ORIGIN` | Origem do front-end aceita pela API | `http://localhost:3000` |
| `COOKIE_SECURE` | Envio dos cookies somente por HTTPS | `false` |
| `SUPERUSUARIO_EMAIL`, `SUPERUSUARIO_SENHA` | Conta de superusuário criada na inicialização | Definido no `docker-compose.yml` |

`GOOGLE_CLIENT_ID`, sem valor padrão, é o ID do cliente OAuth do Google e só é necessária para o login com Google.

## Como executar

```bash
docker compose up
```

Sobe o PostgreSQL (porta 5432) e a API (porta 8080), com a porta 5005 aberta para depuração remota. As tabelas são criadas pelas migrations do Flyway em `src/main/resources/db/migration`.

- **API:** <http://localhost:8080>
- **Swagger UI:** <http://localhost:8080/swagger-ui.html>
- **Especificação OpenAPI:** <http://localhost:8080/v3/api-docs>

Para parar: `docker compose down`. Para apagar também os dados do banco: `docker compose down -v`.

### Dados de demonstração

O Docker Compose ativa o perfil `dev`, que cria um superusuário e usuários de teste (`usuario-teste-01@motivafit.com` em diante) com treinos e registros. As credenciais padrão estão em `DadosDemonstracaoBootstrap.java` e servem apenas para o ambiente local.

## Testes

```bash
docker compose --profile testing run --rm test
```

Com Java 25, Maven e Docker instalados, também é possível rodar direto na máquina:

```bash
mvn verify
```

O `mvn verify` gera o relatório de cobertura em `target/site/jacoco/index.html` e falha se a cobertura de linhas ficar abaixo de 70%. Parte dos testes usa Testcontainers e precisa do Docker em execução.

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
