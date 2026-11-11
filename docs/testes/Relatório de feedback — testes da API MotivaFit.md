# Relatório de feedback — testes da API MotivaFit

**Data:** 09/11/2026  
**Ambiente:** WSL/Ubuntu, backend local, PostgreSQL local  
**Backend:** `http://localhost:8080`  
**Origem informada nos testes:** `http://localhost:3000`  
**Banco:** PostgreSQL local, banco `motivafit_test`  

## 1. Conclusão geral

Os testes registrados neste relatório foram executados diretamente contra a API REST, utilizando `curl`. Eles validam a comunicação entre o cliente HTTP, o backend Spring Boot e o banco PostgreSQL.

Portanto, são **testes de integração da API/backend com o banco de dados**. Eles ainda **não são testes de integração entre a interface frontend e o backend**, porque o frontend não foi iniciado e nenhum botão ou tela foi usado para gerar as requisições.

Resultado geral dos casos comprovados no log:

- API disponível: aprovado;
- cadastro válido: aprovado;
- validação de senha fraca: aprovado;
- login válido: aprovado;
- rota protegida sem token: aprovado;
- listagem autenticada de treinos: aprovado;
- criação de treino autenticada: aprovado;
- CORS para `http://localhost:3000`: aparentemente aprovado pelos cabeçalhos retornados;
- cadastro duplicado: não há evidência suficiente no log para classificá-lo como executado;
- integração frontend–backend pela interface: ainda pendente.

## 2. Resultados detalhados

| ID | Caso | Requisição/ação | Resultado esperado | Resultado observado | Situação |
|---|---|---|---:|---:|---|
| T01 | Acesso à API usando HTTPS | `GET https://localhost:8080/v3/api-docs` | Resposta da API | Falha de conexão | Não é defeito confirmado |
| T02 | Acesso à documentação usando HTTP | `GET http://localhost:8080/v3/api-docs` | `200` | `HTTP/1.1 200` e especificação OpenAPI retornada | Aprovado |
| T03 | Cadastro válido | `POST /api/auth/cadastro` com e-mail novo e senha forte | `201` | `HTTP/1.1 201`; usuário criado com perfil `USUARIO` | Aprovado |
| T04 | Senha fraca | `POST /api/auth/cadastro` com senha `123` | `400` | `HTTP/1.1 400`; mensagem de senha inválida | Aprovado |
| T05 | Login válido | `POST /api/auth/login` com credenciais cadastradas | `200` e token JWT | `HTTP/1.1 200`; token e `expirationAt` retornados; cookies também foram enviados | Aprovado |
| T06 | Obter token para chamadas protegidas | Extração de `.token` com `jq` | Token não vazio | Inicialmente vazio porque o `jq` ainda não estava instalado/extraído; após instalar e executar novamente, token foi obtido | Corrigido durante a execução |
| T07 | Listar treinos sem autenticação | `GET /api/treinos` sem `Authorization` | `401` | `HTTP/1.1 401`; `AUTENTICACAO_NECESSARIA` | Aprovado |
| T08 | Listar treinos autenticado | `GET /api/treinos` com `Bearer TOKEN` | `200` | `HTTP/1.1 200`; lista vazia `[]` | Aprovado |
| T09 | Criar treino autenticado | `POST /api/treinos` com nome, tipo `MUSCULACAO` e visibilidade `PRIVADO` | `201` | `HTTP/1.1 201`; treino criado com `id: 1` | Aprovado |
| T10 | CORS da origem do frontend | Requisições com `Origin: http://localhost:3000` | Cabeçalho de origem permitida | Respostas retornaram `Access-Control-Allow-Origin: http://localhost:3000` e `Access-Control-Allow-Credentials: true` | Aparentemente aprovado |
| T11 | Cadastro duplicado | Repetir cadastro com o mesmo e-mail | `409` | Não há evidência clara no log de uma segunda tentativa válida com o mesmo e-mail | Pendente |
| T12 | Persistência após criação | Listar novamente após criar treino | Treino criado aparecer na lista | O log disponível comprova a criação, mas não contém uma nova listagem posterior suficientemente clara | Pendente de confirmação |

## 3. Interpretação dos resultados

### 3.1 O backend está funcionando

O retorno `HTTP/1.1 200` em `/v3/api-docs` confirma que a aplicação está em execução na porta `8080`. O cadastro retornou `201`, o login retornou `200`, a rota sem autenticação retornou `401` e a criação de treino retornou `201`.

Isso demonstra que o fluxo abaixo funcionou:

```text
curl
  -> API Spring Boot
  -> autenticação/validação
  -> PostgreSQL
  -> resposta HTTP
```

### 3.2 A criação de treino é um teste de integração?

Sim, no sentido de integração entre a API e o banco. O endpoint autenticado recebeu o JWT, identificou o usuário e criou um registro de treino. Contudo, como a requisição foi feita pelo `curl`, não houve participação do frontend.

A classificação mais precisa é:

> Teste de integração de API/backend com persistência e autenticação.

Para ser um teste de integração frontend–backend, seria necessário executar a aplicação frontend, interagir com a tela e observar a requisição saindo da página em `http://localhost:3000` para a API em `http://localhost:8080`.

## 4. Feedback para o time de backend

### B01 — Confirmar cadastro duplicado

O roteiro prevê que um e-mail já cadastrado retorne `409`. Esse caso não ficou comprovado no log. Reexecutar:

```bash
curl -i -X POST "$BASE_URL/api/auth/cadastro" \
  -H 'Content-Type: application/json' \
  -H 'Origin: http://localhost:3000' \
  -d "{\"email\":\"$EMAIL\",\"senha\":\"$SENHA\"}"
```

O esperado é `HTTP/1.1 409`.

### B02 — Confirmar persistência do treino

Após o `POST /api/treinos` retornar `201`, executar novamente:

```bash
curl -i "$BASE_URL/api/treinos" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Origin: http://localhost:3000'
```

O treino criado deve aparecer na lista. Isso fecha a evidência de persistência no banco.

### B03 — Manter documentação coerente com o contrato

A documentação OpenAPI retornada informa corretamente os principais códigos de resposta dos endpoints testados. O time deve manter a documentação atualizada quando adicionar ou alterar campos de cadastro, login ou treino.

### B04 — Não tratar o erro de HTTPS como falha da API

A tentativa abaixo falhou:

```bash
curl -i https://localhost:8080/v3/api-docs
```

O backend local está configurado para HTTP, não HTTPS. O comando correto é:

```bash
curl -i http://localhost:8080/v3/api-docs
```

Esse item não exige correção no backend, a menos que o projeto passe a exigir TLS local.

## 5. Feedback para o time de frontend

### F01 — Resolver conflito de merge no frontend

Foi identificado anteriormente o arquivo:

```text
frontend/MotivaFit/src/pages-user/pagina-principal.tsx
```

com marcadores de conflito Git:

```text
<<<<<<< HEAD
=======
>>>>>>> developer
```

Esses marcadores não pertencem ao código final e impedem ou podem impedir a compilação do frontend. É necessário escolher e combinar manualmente a implementação correta, remover os três marcadores e testar:

```bash
grep -R -n -E '^(<<<<<<<|=======|>>>>>>>)' frontend/MotivaFit/src
npm run build
npm run lint
```

O comando `grep` não deve retornar nenhum marcador, e o build deve terminar sem erro.

### F02 — Confirmar URL da API

Com o frontend em `http://localhost:3000`, a camada de API deve chamar:

```text
http://localhost:8080
```

O frontend não deve tentar enviar requisições da API para a própria porta `3000`.

### F03 — Confirmar uso real das funções de API

As telas de login, cadastro e treinos devem chamar as funções da camada de API, e não apenas atualizar `localStorage` ou dados locais. O fluxo esperado é:

```text
Tela de login
  -> auth-api.ts
  -> POST http://localhost:8080/api/auth/login
```

E:

```text
Tela de treinos
  -> treinos-api.ts
  -> GET/POST http://localhost:8080/api/treinos
```

### F04 — Verificar CORS pelo navegador

Os testes via `curl` receberam cabeçalhos compatíveis com a origem `http://localhost:3000`. Ainda é necessário confirmar no navegador, porque o browser aplica as regras de CORS e preflight de forma diferente do `curl`.

## 6. O que ainda falta testar pelo frontend

Depois de corrigir o conflito e iniciar o frontend, executar pela interface:

1. Abrir `http://localhost:3000`;
2. Cadastrar um novo usuário pela tela;
3. Confirmar no DevTools > Network que ocorreu `POST /api/auth/cadastro`;
4. Fazer login pela tela;
5. Confirmar `POST /api/auth/login` e o retorno do token;
6. Abrir a tela de treinos;
7. Confirmar `GET /api/treinos`;
8. Criar um treino pela tela;
9. Confirmar `POST /api/treinos` com resposta `201`;
10. Atualizar a tela e confirmar que o treino permanece disponível.

Esses serão os testes de integração frontend–backend propriamente ditos.

## 7. Cuidados com o registro

Não adicionar ao GitHub:

- JWT completo;
- cookies `refreshToken` ou `csrfToken`;
- senha do banco;
- arquivo `.env` com credenciais;
- logs contendo tokens reais.

No relatório compartilhado, registrar apenas os códigos HTTP, mensagens resumidas e o identificador anonimizado do caso.

## 8. Conclusão para o time

A API está operacional e os principais fluxos de cadastro, autenticação, autorização e criação de treino foram aprovados por chamadas diretas. Não foi identificado, neste log, um defeito funcional confirmado no backend.

Os próximos pontos são:

1. resolver os marcadores `<<<<<<< HEAD`, `=======` e `>>>>>>> developer` no frontend;
2. garantir que o frontend compile;
3. confirmar a URL `http://localhost:8080` na camada de API;
4. repetir cadastro, login e criação de treino pela interface;
5. executar novamente os casos de cadastro duplicado e persistência para completar as evidências.
