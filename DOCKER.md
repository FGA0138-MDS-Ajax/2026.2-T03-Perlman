# Docker Compose

Execute todos os comandos na raiz do projeto. O único Compose é `compose.yaml`:

| Serviço | Origem | Dependência |
| :-- | :-- | :-- |
| `db` | Imagem `postgres:16-alpine` | — |
| `backend` | `backend/MotivaFIt/Dockerfile` | `db` |
| `frontend` | `frontend/MotivaFit/Dockerfile` | `backend` |
| `nginx` | Imagem `nginx:alpine`, configuração em `nginx/default.conf` | `frontend` |

O frontend serve o build estático React/Vite. O proxy nginx encaminha `/api/`,
`/swagger-ui` e `/v3/api-docs` ao backend e as demais rotas ao frontend.
Somente o nginx publica uma porta no host, em `127.0.0.1:8080` por padrão.
O banco persiste os dados no volume `postgres_data`.

## Executar

```bash
cp .env.production.example .env
openssl rand -base64 32
```

Preencha `.env` com `DB_PASSWORD`, `JWT_SECRET` (o segredo gerado),
`SUPERUSUARIO_EMAIL`, `SUPERUSUARIO_SENHA` e `CORS_ALLOWED_ORIGIN`.
Não envie esse arquivo ao Git. Para uso local por HTTP, defina
`CORS_ALLOWED_ORIGIN=http://localhost:8080` e `COOKIE_SECURE=false`.
Em produção, use a origem HTTPS pública e `COOKIE_SECURE=true`.

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f backend
```

Acesse a aplicação em `http://localhost:8080` e o Swagger em
`http://localhost:8080/swagger-ui.html`. `APP_PORT` altera a porta publicada;
ajuste também a origem em `CORS_ALLOWED_ORIGIN`.

O `depends_on` ordena a partida: banco → backend → frontend → nginx.
Ele não espera os serviços ficarem prontos. Não há script de espera ou timer;
durante a inicialização do backend, a API ainda pode retornar 502.
`restart: unless-stopped` permite reiniciar o backend se o banco ainda estiver
indisponível na primeira tentativa.

Para produção, configure um proxy HTTPS de entrada apontando para
`127.0.0.1:8080`, preservando Host e sobrescrevendo X-Forwarded-Proto.
Para login Google, preencha `GOOGLE_CLIENT_ID`: ele é usado pelo backend e
no build do frontend. Alterações exigem novo build.

Para parar, use `docker compose down`. Evite `docker compose down -v` se
quiser preservar o banco. As migrations Flyway executam na inicialização.

Esta configuração substitui a imagem única anterior. O deploy deve executar
o Compose; serviços configurados para construir o antigo Dockerfile da raiz
precisam ter sua configuração de implantação alterada.
