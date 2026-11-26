# Docker na raiz

O `Dockerfile` da raiz compila o frontend React/Vite e o backend Java 25.
A imagem final executa Spring Boot e nginx com Supervisor, sem scripts `.sh`
ou espera programada. O nginx serve o frontend em `8080` e encaminha a API
para `127.0.0.1:8081`. O backend não expõe uma porta pública própria.

## Docker Compose

Execute na raiz. O `compose.yaml` tem dois serviços: `db` (PostgreSQL 16 com
volume `postgres_data`) e `app` (a imagem unificada), com `app` dependendo de `db`.

Se ainda não possui o arquivo de configuração:

```bash
cp .env.production.example .env.production
openssl rand -base64 32
```

Preencha `DB_PASSWORD`, `JWT_SECRET` (o segredo gerado), `SUPERUSUARIO_EMAIL`,
`SUPERUSUARIO_SENHA` e `CORS_ALLOWED_ORIGIN`. Não envie esse arquivo ao Git.
Para HTTP local, use `CORS_ALLOWED_ORIGIN=http://localhost:8080` e
`COOKIE_SECURE=false`. Em produção, use sua origem HTTPS e `COOKIE_SECURE=true`.

```bash
docker compose --env-file .env.production up -d --build
docker compose --env-file .env.production logs -f app
```

Aplicação: `http://localhost:8080`. Swagger: `http://localhost:8080/swagger-ui.html`.
`APP_PORT` altera a porta publicada; ajuste também `CORS_ALLOWED_ORIGIN`.
A publicação local é apenas em `127.0.0.1`.

`depends_on` ordena a partida do banco e da aplicação, sem esperar prontidão.
Supervisor inicia e monitora backend e nginx; o frontend já foi compilado.
A API pode retornar 502 durante o início. `/healthz` retorna 200 quando o
backend responde ao recurso público do Swagger; não é uma verificação contínua
da conexão com o banco.

Para parar, use `docker compose --env-file .env.production down`. A opção `-v`
apaga o volume do banco; não a use para uma atualização comum. As migrations
Flyway executam na inicialização. Volumes dos Composes antigos não são migrados
automaticamente; preserve o nome do projeto Compose para reutilizar `postgres_data`.

## Render: um Web Service e um PostgreSQL

No Web Service existente, selecione a branch com estas alterações:

| Campo | Valor |
| :-- | :-- |
| Language | Docker |
| Root Directory | Vazio (raiz do repositório) |
| Dockerfile Path | `./Dockerfile` |
| Docker Build Context | `.` |
| Docker Command | Vazio (usa o CMD da imagem) |
| Health Check Path | `/healthz` |

Em Environment, configure:

```dotenv
PORT=8080
SPRING_PROFILES_ACTIVE=prod
SERVER_ADDRESS=127.0.0.1
SERVER_PORT=8081
DB_URL=jdbc:postgresql://HOST_INTERNO_DO_RENDER:5432/NOME_DO_BANCO
DB_USER=USUARIO_DO_RENDER
DB_PASSWORD=SENHA_DO_RENDER
JWT_ISSUER=motivafit
COOKIE_SECURE=true
CORS_ALLOWED_ORIGIN=https://two026-2-t03-perlman.onrender.com
OPENAPI_SERVER_URL=https://two026-2-t03-perlman.onrender.com
SUPERUSUARIO_EMAIL=admin@admin.com
```

Adicione `JWT_SECRET`, `SUPERUSUARIO_SENHA` e `GOOGLE_CLIENT_ID` usando seus
valores reais. Banco, usuário e senha devem corresponder ao PostgreSQL do Render,
na mesma região. `DB_DATABASE` e `APP_PORT` são variáveis do Compose, não substituem
`DB_URL` e `PORT` no Render. Remova eventuais overrides antigos de `SERVER_PORT`
ou `SERVER_ADDRESS` que conflitem com os valores acima.

O Render não lê o `.env.production` local nem executa o Compose: constrói a
imagem pelo Dockerfile da raiz. O PostgreSQL continua separado, gerenciado pelo
Render. O health check `/healthz` evita liberar o deploy apenas porque o frontend
já abriu, enquanto o backend ainda não atende HTTP.

`GOOGLE_CLIENT_ID` é usado também como argumento de build do frontend. Depois
de alterá-lo, faça novo deploy. Não configure `VITE_API_BASE_URL` com outro host:
o frontend usa `/api` na mesma origem. O HTTPS termina no proxy do Render.

Referências: [Docker no Render](https://render.com/docs/docker),
[health checks](https://render.com/docs/health-checks).

## Imagem independente

```bash
docker build --build-arg GOOGLE_CLIENT_ID="SEU_CLIENT_ID" -t motivafit .
docker run --rm --env-file .env.production -p 127.0.0.1:8080:8080 motivafit
```

Para `docker run`, acrescente ao arquivo `DB_URL` com uma URL JDBC acessível
pelo contêiner e as credenciais desse banco. O hostname `db` só existe na rede
do Compose. Não há banco embutido na imagem.
