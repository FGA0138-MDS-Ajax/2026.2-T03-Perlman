# Produção com Docker

O `Dockerfile` da raiz compila React/Vite e Java 25 e executa Nginx e Spring
Boot no mesmo container, sem root. O Nginx expõe a porta 8080 e encaminha
`/api` ao backend interno (127.0.0.1:8081). O Compose mantém o PostgreSQL
separado, sem porta pública, com dados persistidos em volume.

## Executar

```bash
cp .env.production.example .env.production
openssl rand -base64 32
```

Preencha `.env.production` com o segredo gerado, uma senha forte para o banco,
as credenciais iniciais do administrador e a URL pública HTTPS em
`CORS_ALLOWED_ORIGIN` (sem barra final). A senha do administrador só é usada
na criação inicial da conta. Não envie esse arquivo ao Git.

```bash
docker compose --env-file .env.production -f compose.prod.yaml up -d --build
docker compose --env-file .env.production -f compose.prod.yaml ps
docker compose --env-file .env.production -f compose.prod.yaml logs -f app
```

Configure um proxy HTTPS no servidor para encaminhar seu domínio a
`http://127.0.0.1:8080`, preservando Host e sobrescrevendo X-Forwarded-Proto.
A porta do Compose é publicada apenas no loopback. Os cookies são Secure:
o acesso de produção deve ocorrer por HTTPS.

Para Google, use o Client ID completo em `GOOGLE_CLIENT_ID` e autorize a URL
pública nas origens JavaScript da credencial OAuth Web. O Compose usa esse
mesmo ID no build do frontend e no backend. Mudanças exigem novo build.

## Banco externo e imagem independente

```bash
docker build --build-arg VITE_GOOGLE_CLIENT_ID="SEU_CLIENT_ID" -t motivafit:production .
```

Execute a imagem com `docker run --env-file ARQUIVO -p 127.0.0.1:8080:8080
motivafit:production`. Esse arquivo precisa fornecer `DB_URL` (por exemplo,
`jdbc:postgresql://HOST:5432/motivafit`), `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`,
`JWT_ISSUER`, `CORS_ALLOWED_ORIGIN`, `GOOGLE_CLIENT_ID` e as credenciais iniciais
`SUPERUSUARIO_EMAIL`/`SUPERUSUARIO_SENHA`. Os `.env` locais não entram na imagem.

O healthcheck verifica o frontend e a resposta 401 do backend para uma rota
protegida sem credenciais. Se um dos processos terminar, o container encerra;
o Compose o reinicia. Faça backup do PostgreSQL antes de atualizações:
as migrations Flyway executam na inicialização. `docker compose down -v`
apaga o volume do banco; não use essa opção para uma atualização comum.
