# MotivaFit — API para o front-end

O que já está pronto no back-end e como usar cada endpoint. Atualizado em 27/10/2026 (API v1.0.0).

## Resumo

- **Já funciona:** cadastro/login/logout, renovação de sessão, catálogo de exercícios e CRUD de treinos.
- **Ainda não existe:** adicionar exercícios a um treino, registrar execução/histórico, ver treinos públicos de outras pessoas e gamificação.
- **Base URL local:** `http://localhost:8080`. Todo corpo é JSON (`Content-Type: application/json`).
- IDs são números; datas vêm em ISO 8601; valores fixos (enums) são em maiúsculas: `MUSCULACAO`, `AEROBICO`, `PRIVADO`, `PUBLICO`.

## Como funciona a autenticação

- O **login** devolve um **token JWT** no corpo (`token` e `expirationAt`). Guarde em memória e mande em todas as chamadas: `Authorization: Bearer <token>`. Ele dura **15 minutos** por padrão.
- O login também grava dois cookies: `refreshToken` (HttpOnly, você não consegue ler) e `csrfToken` (legível pelo JS). Por isso, nas chamadas de login, refresh e logout use `credentials: "include"` (fetch) ou `withCredentials: true` (axios).
- Quando o JWT expirar (ou vier 401), chame o **refresh**. Ele devolve um novo token e troca os cookies. Não reutilize o refresh token antigo: reuso dá 401.
- Em **refresh** e **logout** é obrigatório mandar o cabeçalho `X-CSRF-TOKEN` com o **mesmo valor do cookie csrfToken**. O cabeçalho `Origin` o navegador já envia sozinho, mas a origem do front precisa ser a mesma configurada no back (`CORS_ALLOWED_ORIGIN`), senão dá 403.

Exemplo de refresh no front:

```js
const csrf = document.cookie.split("; ")
  .find(c => c.startsWith("csrfToken=")).split("=")[1];

const res = await fetch("http://localhost:8080/api/auth/refresh", {
  method: "POST",
  credentials: "include",
  headers: { "X-CSRF-TOKEN": csrf }
});
const { token, expirationAt } = await res.json();
```

!!! warning "Pendências para o back-end"
    - **Domínios diferentes:** o exemplo lê o `csrfToken` com `document.cookie`. Com front e API em domínios diferentes, o JavaScript do front não enxerga esse cookie. Confirmar como isso funcionará no deploy.
    - **Cookie ausente:** se o `csrfToken` não existir, o `.find(...)` retorna `undefined` e o `.split` lança erro. O exemplo precisa tratar esse caso.

## Formato dos erros

Todo erro vem neste formato, e o `codigo` é estável (dá para tratar no front):

```json
{
  "codigo": "CREDENCIAIS_INVALIDAS",
  "mensagem": "E-mail ou senha incorretos",
  "dataHora": "2026-10-27T15:04:05Z"
}
```

| Status | Significa |
| :----- | :-------- |
| 400 | Dados inválidos no corpo. |
| 401 | Sem token, token expirado/inválido, login errado ou refresh inválido. |
| 403 | Sem permissão (rotas `/admin`) ou Origin/CSRF errado (refresh e logout). |
| 404 | Não encontrado (inclui treino de outro usuário ou excluído). |
| 409 | Conflito: e-mail já cadastrado ou nome de exercício repetido. |
| 500 | Erro interno. |

## Autenticação

### `POST /api/auth/cadastro`

Cria uma conta nova (perfil USUARIO).

**Acesso:** público

**Corpo da requisição (JSON)**

```json
{
  "email": "usuario@motivafit.com",
  "senha": "SenhaSegura123!"
}
```

**Sucesso:** 201

```json
{ "id": 42, "email": "usuario@motivafit.com", "perfil": "USUARIO", "ativo": true }
```

**Erros:** 400 (e-mail ou senha fora das regras), 409 (e-mail já cadastrado).

**Dica:** senha com no mínimo 12 caracteres, com maiúscula, minúscula, número e símbolo. Espaços no meio podem.

### `POST /api/auth/login`

Faz login. Devolve o JWT no corpo e define os cookies de sessão.

**Acesso:** público

**Corpo da requisição (JSON)**

```json
{
  "email": "usuario@motivafit.com",
  "senha": "SenhaSegura123!"
}
```

**Sucesso:** 200

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "expirationAt": "2026-10-27T18:15:00Z"
}
```

**Erros:** 400 (campos vazios ou inválidos), 401 (e-mail/senha errados ou conta inativa).

**Dica:** mande com `credentials: "include"` para o navegador guardar os cookies.

### `POST /api/auth/refresh`

Renova a sessão: devolve um novo JWT e troca os cookies.

**Acesso:** cookie `refreshToken` + header `X-CSRF-TOKEN`

**Parâmetros:** sem corpo. Cabeçalho `X-CSRF-TOKEN` = valor do cookie `csrfToken`; `Origin` com a origem do front; `credentials: "include"`.

**Sucesso:** 200 (mesmo formato do login)

```json
{ "token": "eyJ...", "expirationAt": "2026-10-27T18:30:00Z" }
```

**Erros:** 401 (refresh token ausente, expirado ou já usado), 403 (Origin ou CSRF inválido).

**Dica:** guarde o novo token e descarte o antigo. Se o refresh der 401, mande o usuário para o login.

### `POST /api/auth/logout`

Encerra a sessão e apaga os cookies.

**Acesso:** cookie `refreshToken` + header `X-CSRF-TOKEN`

**Parâmetros:** sem corpo. Mesmos cabeçalhos do refresh.

**Sucesso:** 204 (sem corpo)

**Erros:** 403 (Origin ou CSRF inválido).

**Dica:** depois do logout, apague o JWT que está em memória no front.

!!! warning "Pendência para o back-end"
    O acesso exige o cookie `refreshToken`, mas o guia não informa o que acontece se ele estiver ausente ou expirado. Confirmar o comportamento.

## Catálogo de exercícios

Exercícios prontos para o usuário escolher. Só aparecem os **ativos**. Precisa do header `Authorization: Bearer <token>`.

### `GET /api/catalogo-exercicios`

Lista os exercícios ativos, em ordem alfabética.

**Acesso:** qualquer usuário logado

**Sucesso:** 200 (lista)

```json
[
  { "id": 1, "nome": "Supino reto", "modalidade": "MUSCULACAO", "grupoMuscular": "Peito" }
]
```

**Erros:** 401.

### `GET /api/catalogo-exercicios/{id}`

Busca um exercício pelo id.

**Acesso:** qualquer usuário logado

**Parâmetros:** `id` na URL, ex.: `/api/catalogo-exercicios/1`

**Sucesso:** 200 (um objeto igual ao da lista)

**Erros:** 401, 404 (não existe ou foi desativado).

## Catálogo — administração

Só para perfis **ADMINISTRADOR** e **SUPERUSUARIO**. Usuário comum recebe 403.

### `POST /api/admin/catalogo-exercicios`

Cria um exercício no catálogo.

**Acesso:** admin

**Corpo da requisição (JSON)**

```json
{
  "nome": "Remada cavalinho",
  "modalidade": "MUSCULACAO",
  "grupoMuscular": "Costas"
}
```

**Sucesso:** 201 (devolve o exercício com id)

**Erros:** 400, 401, 403, 409 (nome já existe, sem diferenciar maiúsculas).

**Dica:** nome até 100 caracteres, grupoMuscular até 50.

### `PUT /api/admin/catalogo-exercicios/{id}`

Altera nome, modalidade e grupo muscular.

**Acesso:** admin

**Parâmetros:** `id` na URL.

**Corpo da requisição (JSON)**

```json
{
  "nome": "Remada cavalinho",
  "modalidade": "MUSCULACAO",
  "grupoMuscular": "Costas"
}
```

**Sucesso:** 200 (devolve o exercício atualizado)

**Erros:** 400, 401, 403, 404, 409 (outro exercício já tem esse nome).

**Dica:** funciona também em exercícios desativados.

### `DELETE /api/admin/catalogo-exercicios/{id}`

Desativa o exercício (não apaga de verdade).

**Acesso:** admin

**Parâmetros:** `id` na URL.

**Sucesso:** 204 (sem corpo)

**Erros:** 401, 403, 404.

**Dica:** ele some do catálogo, mas treinos que já o usam continuam preservados.

## Treinos

Os treinos são sempre do usuário logado: cada um só enxerga os seus. Precisa do header `Authorization: Bearer <token>`.

### `GET /api/treinos`

Lista os treinos ativos do usuário (excluídos não aparecem).

**Acesso:** usuário logado

**Sucesso:** 200 (lista de objetos como o abaixo; vazia se não tiver nenhum)

```json
{
  "id": 12,
  "nome": "Treino A - Peito e Tríceps",
  "tipo": "MUSCULACAO",
  "visibilidade": "PRIVADO",
  "createdAt": "2026-10-27T15:04:05Z",
  "updatedAt": "2026-10-27T15:04:05Z"
}
```

**Erros:** 401.

### `POST /api/treinos`

Cria um treino.

**Acesso:** usuário logado

**Corpo da requisição (JSON)**

```json
{
  "nome": "Treino A - Peito e Tríceps",
  "tipo": "MUSCULACAO",
  "visibilidade": "PRIVADO"
}
```

**Sucesso:** 201 (devolve o treino com id)

```json
{
  "id": 12,
  "nome": "Treino A - Peito e Tríceps",
  "tipo": "MUSCULACAO",
  "visibilidade": "PRIVADO",
  "createdAt": "2026-10-27T15:04:05Z",
  "updatedAt": "2026-10-27T15:04:05Z"
}
```

**Erros:** 400, 401.

**Dica:** nome é obrigatório (até 150 caracteres) e tipo é `MUSCULACAO` ou `AEROBICO`. Se não mandar visibilidade, vira `PRIVADO`.

### `GET /api/treinos/{id}`

Busca um treino pelo id.

**Acesso:** usuário logado

**Parâmetros:** `id` na URL, ex.: `/api/treinos/12`

**Sucesso:** 200 (objeto do treino)

**Erros:** 401, 404 (não existe, foi excluído ou é de outro usuário).

### `PUT /api/treinos/{id}`

Altera nome, tipo e (se enviada) a visibilidade.

**Acesso:** usuário logado

**Parâmetros:** `id` na URL.

**Corpo da requisição (JSON)**

```json
{
  "nome": "Treino A - Peito e Tríceps",
  "tipo": "MUSCULACAO",
  "visibilidade": "PRIVADO"
}
```

**Sucesso:** 200 (treino atualizado)

**Erros:** 400, 401, 404.

**Dica:** se não mandar visibilidade, ela não muda.

### `DELETE /api/treinos/{id}`

Exclui o treino (arquiva, o histórico é mantido).

**Acesso:** usuário logado

**Parâmetros:** `id` na URL.

**Sucesso:** 204 (sem corpo)

**Erros:** 401, 404.

## Valores fixos (enums)

| Campo | Valores |
| :---- | :------ |
| `tipo` (treino) e `modalidade` (exercício) | `MUSCULACAO`, `AEROBICO` |
| `visibilidade` (treino) | `PRIVADO`, `PUBLICO` |
| `perfil` (usuário) | `USUARIO`, `ADMINISTRADOR`, `SUPERUSUARIO` |

Os exemplos acima são ilustrativos. A fonte é a especificação OpenAPI (Swagger) da aplicação; qualquer mudança nos endpoints deve atualizar este guia.
