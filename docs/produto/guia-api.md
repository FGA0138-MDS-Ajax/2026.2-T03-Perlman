# MotivaFit — API para o front-end

O que já está pronto no back-end e como usar cada endpoint. Atualizado em 18/11/2026 a partir das anotações OpenAPI do código (branch `developer`, commit `8d27ae3`). A primeira versão deste guia é de 27/10/2026 (API v1.0.0).

## Resumo

- **Já funciona:** cadastro, login com e-mail e senha ou com Google, logout e renovação de sessão; catálogo de exercícios; treinos próprios e públicos, com cópia de treino público; exercícios dentro do treino; registro de execução e histórico; evolução pessoal; métricas administrativas; consulta, exportação e exclusão de conta; convites de administrador.
- **Ainda não existe no back-end:** desafios, recordes calculados, conquistas e streak.
- **Base URL local:** `http://localhost:8080`. Todo corpo é JSON (`Content-Type: application/json`).
- IDs são números; datas vêm em ISO 8601; valores fixos (enums) são em maiúsculas, como `MUSCULACAO`, `AEROBICO`, `PRIVADO` e `PUBLICO`.
- A documentação interativa fica em `http://localhost:8080/swagger-ui.html`, e a especificação OpenAPI, em `http://localhost:8080/v3/api-docs`.

## Como funciona a autenticação

- O **login** devolve um **token JWT** no corpo (`token` e `expirationAt`). Guarde em memória e mande em todas as chamadas: `Authorization: Bearer <token>`. Ele dura **15 minutos** por padrão.
- O login também grava dois cookies: `refreshToken` (HttpOnly, você não consegue ler, com caminho `/api/auth`) e `csrfToken` (legível pelo JS). Por isso, nas chamadas de login, refresh e logout use `credentials: "include"` (fetch) ou `withCredentials: true` (axios).
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

## Perfis de acesso

| Perfil | Pode acessar |
| :-- | :-- |
| `USUARIO` | Rotas autenticadas do próprio usuário: treinos, exercícios do treino, registros, evolução e a própria conta |
| `ADMINISTRADOR` | Tudo do usuário, mais a manutenção do catálogo, as métricas administrativas e a exportação e consulta de contas |
| `SUPERUSUARIO` | Tudo do administrador, mais a criação de convites de administrador |

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
| 400 | Dados ou parâmetros inválidos. |
| 401 | Sem token, token expirado/inválido, login errado ou refresh inválido. |
| 403 | Perfil sem permissão ou Origin/CSRF errado (refresh e logout). |
| 404 | Não encontrado. Recursos de outro usuário são tratados como inexistentes. |
| 409 | Conflito: e-mail já cadastrado, nome de exercício repetido, treino que já é do usuário ou convite pendente para o mesmo e-mail. |
| 500 | Erro interno. |

## Autenticação

### `POST /api/auth/cadastro`

Cria uma conta nova (perfil USUARIO). A senha é armazenada como hash.

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

**Dica:** senha com no mínimo 6 caracteres, com letra maiúscula, letra minúscula, número e símbolo.

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

### `POST /api/auth/google`

Faz login com o ID Token do Google OAuth 2.0. Se o e-mail ainda não estiver cadastrado, cria uma conta com perfil USUARIO.

**Acesso:** público

**Corpo da requisição (JSON)**

```json
{ "idToken": "<ID Token emitido pelo Google>" }
```

**Sucesso:** 200 (mesmo formato do login, com os mesmos cookies de sessão)

**Erros:** 400 (token do Google inválido), 401 (token do Google inválido ou conta inativa).

**Dica:** o back-end precisa da variável `GOOGLE_CLIENT_ID` configurada.

### `POST /api/auth/refresh`

Renova a sessão: revoga o refresh token atual e emite outro da mesma família, junto com um novo JWT.

**Acesso:** cookie `refreshToken` + header `X-CSRF-TOKEN`

**Parâmetros:** sem corpo. Cabeçalho `X-CSRF-TOKEN` = valor do cookie `csrfToken`; `Origin` com a origem do front; `credentials: "include"`.

**Sucesso:** 200 (mesmo formato do login)

```json
{ "token": "eyJ...", "expirationAt": "2026-10-27T18:30:00Z" }
```

**Erros:** 401 (refresh token ausente, inválido, expirado ou reutilizado), 403 (Origin ou CSRF inválido).

**Dica:** guarde o novo token e descarte o antigo. Se o refresh der 401, mande o usuário para o login.

### `POST /api/auth/logout`

Encerra a sessão: revoga a família do refresh token e expira os cookies.

**Acesso:** cookie `refreshToken` + header `X-CSRF-TOKEN`

**Parâmetros:** sem corpo. Mesmos cabeçalhos do refresh.

**Sucesso:** 204 (sem corpo)

**Erros:** 403 (Origin ou CSRF inválido).

**Dica:** depois do logout, apague o JWT que está em memória no front.

!!! warning "Pendência para o back-end"
    O acesso exige o cookie `refreshToken`, mas a documentação não informa o que acontece se ele estiver ausente ou expirado. Confirmar o comportamento.

## Conta

Precisa do header `Authorization: Bearer <token>`.

| Rota | O que faz | Acesso | Sucesso | Erros |
| :-- | :-- | :-- | :-: | :-- |
| `GET /api/conta/exportacao` | Lista todas as contas cadastradas | `ADMINISTRADOR` ou `SUPERUSUARIO` | 200 | 401, 403 |
| `GET /api/conta/{id}` | Retorna os dados de uma conta | A própria conta, ou `ADMINISTRADOR` e `SUPERUSUARIO` | 200 | 401, 403, 404 |
| `DELETE /api/conta/{id}` | Exclui a conta | A própria conta, ou `ADMINISTRADOR` e `SUPERUSUARIO` | 204 | 401, 403, 404 |

As respostas usam o mesmo formato do cadastro: `id`, `email`, `perfil` e `ativo`.

## Catálogo de exercícios

Exercícios prontos para o usuário escolher. Só aparecem os **ativos**. Precisa do header `Authorization: Bearer <token>`.

### `GET /api/catalogo-exercicios`

Lista os exercícios ativos, em ordem alfabética.

**Acesso:** qualquer usuário logado

**Sucesso:** 200 (lista)

```json
[
  { "id": 1, "nome": "Supino reto", "modalidade": "MUSCULACAO", "grupoMuscular": "Peito", "imagemUrl": "..." }
]
```

**Erros:** 401.

### `GET /api/catalogo-exercicios/{id}`

Busca um exercício ativo pelo id.

**Acesso:** qualquer usuário logado

**Parâmetros:** `id` na URL, ex.: `/api/catalogo-exercicios/1`

**Sucesso:** 200 (um objeto igual ao da lista)

**Erros:** 401, 404 (não existe ou foi desativado).

## Catálogo — administração

Só para perfis **ADMINISTRADOR** e **SUPERUSUARIO**. Usuário comum recebe 403.

### `POST /api/admin/catalogo-exercicios`

Cria um exercício ativo no catálogo.

**Acesso:** admin

**Corpo da requisição (JSON)**

```json
{
  "nome": "Remada cavalinho",
  "modalidade": "MUSCULACAO",
  "grupoMuscular": "Costas",
  "imagemUrl": "..."
}
```

**Sucesso:** 201 (devolve o exercício com id)

**Erros:** 400 (dados inválidos ou imagem ausente), 401, 403, 409 (nome já existe, sem diferenciar maiúsculas).

**Dica:** `nome` até 100 caracteres, `grupoMuscular` até 50. A imagem (`imagemUrl`) é obrigatória na criação.

### `PUT /api/admin/catalogo-exercicios/{id}`

Altera nome, modalidade, grupo muscular e imagem.

**Acesso:** admin

**Parâmetros:** `id` na URL.

**Corpo da requisição:** igual ao da criação.

**Sucesso:** 200 (devolve o exercício atualizado)

**Erros:** 400, 401, 403, 404, 409 (outro exercício já tem esse nome).

**Dica:** funciona também em exercícios desativados. A imagem só é obrigatória se o exercício ainda não tiver uma.

### `DELETE /api/admin/catalogo-exercicios/{id}`

Desativa o exercício (não apaga de verdade).

**Acesso:** admin

**Parâmetros:** `id` na URL.

**Sucesso:** 204 (sem corpo)

**Erros:** 401, 403, 404.

**Dica:** ele some do catálogo, mas treinos e registros que já o usam continuam preservados.

## Treinos

Precisa do header `Authorization: Bearer <token>`. O usuário vê os próprios treinos e os treinos **públicos** de outras pessoas, mas só altera os próprios.

### `GET /api/treinos`

Lista os treinos ativos do usuário e os treinos públicos de outros usuários (excluídos não aparecem).

**Acesso:** usuário logado

**Sucesso:** 200 (lista de objetos como o abaixo; vazia se não tiver nenhum)

```json
{
  "id": 12,
  "nome": "Treino A - Peito e Tríceps",
  "tipo": "MUSCULACAO",
  "visibilidade": "PRIVADO",
  "createdAt": "2026-10-27T15:04:05Z",
  "updatedAt": "2026-10-27T15:04:05Z",
  "meuTreino": true,
  "podeEditar": true
}
```

**Erros:** 401.

**Dica:** `meuTreino` e `podeEditar` indicam se o treino é do usuário. Treino público de outra pessoa pode ser consultado, mas não alterado.

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

**Sucesso:** 201 (devolve o treino com id, no formato da listagem)

**Erros:** 400, 401.

**Dica:** nome é obrigatório (até 150 caracteres) e tipo é MUSCULACAO ou AEROBICO. Se não mandar visibilidade, vira PRIVADO.

### `GET /api/treinos/{id}`

Busca um treino do usuário ou um treino público de outro usuário.

**Acesso:** usuário logado

**Parâmetros:** `id` na URL, ex.: `/api/treinos/12`

**Sucesso:** 200 (objeto do treino)

**Erros:** 401, 404 (não existe, foi excluído ou é privado de outro usuário).

### `PUT /api/treinos/{id}`

Altera nome, tipo e (se enviada) a visibilidade de um treino do usuário.

**Acesso:** usuário logado

**Parâmetros:** `id` na URL.

**Corpo da requisição:** igual ao da criação.

**Sucesso:** 200 (treino atualizado)

**Erros:** 400, 401, 404 (inclui treino de outro usuário, mesmo público).

**Dica:** se não mandar visibilidade, ela não muda.

### `DELETE /api/treinos/{id}`

Exclui o treino (arquiva, o histórico é mantido).

**Acesso:** usuário logado

**Parâmetros:** `id` na URL.

**Sucesso:** 204 (sem corpo)

**Erros:** 401, 404.

### `POST /api/treinos/{id}/adicionar`

Copia um treino público de outro usuário, com os seus exercícios, para a lista do usuário. A cópia é um novo treino PRIVADO; registros e metas de recorde não são copiados.

**Acesso:** usuário logado

**Parâmetros:** `id` do treino público na URL.

**Sucesso:** 201 (devolve a cópia criada)

**Erros:** 401, 404 (inexistente, excluído ou privado de outro usuário), 409 (o treino já é do usuário).

## Exercícios do treino

Associam um item do catálogo a um treino, com a meta do usuário. Precisa do header `Authorization: Bearer <token>`.

| Rota | O que faz | Sucesso | Erros |
| :-- | :-- | :-: | :-- |
| `GET /api/treinos/{treinoId}/exercicios` | Lista os exercícios de um treino próprio ou público, do mais antigo para o mais novo | 200 | 401, 404 |
| `POST /api/treinos/{treinoId}/exercicios` | Inclui um item ativo do catálogo em um treino do usuário | 201 | 400, 401, 404 |
| `PUT /api/treinos/{treinoId}/exercicios/{id}` | Altera a meta e o recorde de um exercício do treino | 200 | 400, 401, 404 |
| `DELETE /api/treinos/{treinoId}/exercicios/{id}` | Remove o exercício do treino | 204 | 401, 404 |

**Corpo de `POST` e `PUT` (JSON)**

```json
{
  "meta": "4 séries de 10 repetições",
  "metaRecorde": "80 kg",
  "treinoId": 12,
  "catalogoExercicioId": 1
}
```

**Resposta:** `id`, `meta`, `metaRecorde`, `treinoId` e `catalogoExercicioId`.

**Dicas:**

- `meta` é obrigatória (até 255 caracteres); `metaRecorde` é opcional (até 255).
- O `treinoId` do corpo precisa ser o mesmo da URL, e no `PUT` o item do catálogo não pode ser trocado.
- Ao remover um exercício do treino, os registros de execução anteriores continuam no histórico com o nome do exercício.

## Registros de execução

Registram que o usuário executou um exercício do catálogo. Precisa do header `Authorization: Bearer <token>`. Registros de outros usuários são tratados como inexistentes.

| Rota | O que faz | Sucesso | Erros |
| :-- | :-- | :-: | :-- |
| `POST /api/registros` | Registra uma execução | 201 | 400, 401, 404 |
| `GET /api/registros?pagina=0&tamanho=50` | Lista o histórico do mais recente para o mais antigo | 200 | 400, 401 |
| `GET /api/registros/{id}` | Busca um registro | 200 | 401, 404 |
| `PUT /api/registros/{id}` | Atualiza os dados da execução | 200 | 400, 401, 404 |
| `DELETE /api/registros/{id}` | Exclui o registro permanentemente | 204 | 401, 404 |

**Corpo de `POST` e `PUT`**

| Campo | Obrigatório | Regra |
| :-- | :-: | :-- |
| `catalogoId` | Sim | Exercício do catálogo. Não pode ser alterado no `PUT` |
| `treinoId`, `exercicioId` | Não | Treino e exercício do treino de onde veio a execução |
| `cargaKg` | Não | Não negativa; até 6 dígitos inteiros e 2 decimais |
| `repeticoes`, `series` | Não | Maiores que zero |
| `tempoS` | Sim | Tempo de execução em segundos, maior que zero |
| `distanciaM` | Não | Distância em metros, maior que zero |
| `executadoEm` | Não | Data e hora da execução |
| `chaveIdempotencia` | Não | Até 100 caracteres. Reenviar a mesma chave devolve o registro original em vez de criar outro |

**Resposta:** `id`, `catalogoId`, `treinoId`, `exercicioId`, `treinoNome`, `exercicioNome`, `cargaKg`, `repeticoes`, `series`, `tempoS`, `distanciaM` e `executadoEm`.

**Dica:** a listagem é paginada: `pagina` começa em 0, e `tamanho` vai de 1 a 100 (padrão 50).

## Evolução pessoal

### `GET /api/metricas/evolucao`

Agrupa os registros do usuário logado em uma série ao longo do tempo.

**Acesso:** usuário logado

**Parâmetros (query, todos opcionais)**

| Parâmetro | Significado | Padrão |
| :-- | :-- | :-- |
| `catalogoId` | Filtra por um exercício do catálogo | Todos |
| `de`, `ate` | Período, no formato `AAAA-MM-DD` | Últimos 30 dias até hoje |
| `agrupamento` | `DIA`, `SEMANA` ou `MES` | `DIA` |

**Sucesso:** 200, com uma lista de pontos. Cada ponto traz `periodo`, `catalogoId`, `exercicioNome`, `modalidade`, `execucoes`, `cargaMaxKg`, `repeticoesMax`, `seriesTotal`, `volumeKg`, `tempoTotalS`, `distanciaTotalM` e `paceSegPorKm`.

**Erros:** 400 (período ou agrupamento inválido), 401.

**Dica:** o pace é calculado em segundos por quilômetro. O período pode ter no máximo 366 dias.

## Métricas administrativas

Só para perfis **ADMINISTRADOR** e **SUPERUSUARIO**. Todas as rotas ficam em `/api/admin/metricas` e retornam apenas valores agregados.

| Rota | O que retorna | Parâmetros |
| :-- | :-- | :-- |
| `GET /usuarios-ativos` | Contas cadastradas, usuários com ao menos um registro no período e o percentual de ativos | `de`, `ate`, `agrupamento` |
| `GET /frequencia-media` | Média e mediana de dias ativos por semana, com a distribuição por faixa | `de`, `ate` |
| `GET /ranking-tempo-treino` | Tempo total de treino e ranking por posição, sem identificar usuários | `de`, `ate`, `limite` |
| `GET /exercicios-mais-realizados` | Exercícios do catálogo com mais execuções e usuários distintos | `de`, `ate`, `limite` |
| `GET /rotinas` | Treinos ativos por tipo, percentual de treinos públicos e treinos públicos mais adicionados | `de`, `ate`, `limite` |
| `GET /retencao` | Retenção por coorte semanal e taxa de ativação em 7 dias | `ate`, `coortes` |

**Regras dos parâmetros:** `de` e `ate` seguem as mesmas regras da evolução pessoal; `limite` vai de 1 a 50 (padrão 10); `coortes` vai de 1 a 26 (padrão 8).

**Erros:** 400 (parâmetros inválidos), 401, 403.

**Dica:** o ranking de tempo é ocultado (`ocultoPorPrivacidade`) quando há menos de cinco usuários ativos.

## Convites de administrador

### `POST /api/admin/convites`

Cria um convite de administrador válido por sete dias.

**Acesso:** somente `SUPERUSUARIO`

**Corpo da requisição (JSON)**

```json
{ "convidadorId": 1, "email": "novo.admin@motivafit.com" }
```

**Sucesso:** 201, com `id`, `email`, `token` e `expiraEm`.

**Erros:** 400, 401, 403, 404 (usuário convidador não encontrado), 409 (já existe convite pendente para o e-mail).

### `POST /api/admin/convites/aceite`

Aceita o convite e promove o usuário informado a administrador.

**Acesso:** usuário logado

**Corpo da requisição (JSON)**

```json
{ "usuarioId": 42, "token": "<token de 43 caracteres recebido no convite>" }
```

**Sucesso:** 204 (sem corpo)

**Erros:** 400 (dados inválidos ou convite inválido/expirado), 401, 404 (usuário não encontrado).

## Valores fixos (enums)

| Campo | Valores |
| :---- | :------ |
| `tipo` (treino) e `modalidade` (exercício) | `MUSCULACAO`, `AEROBICO` |
| `visibilidade` (treino) | `PRIVADO`, `PUBLICO` |
| `perfil` (usuário) | `USUARIO`, `ADMINISTRADOR`, `SUPERUSUARIO` |
| `agrupamento` (métricas) | `DIA`, `SEMANA`, `MES` |

Os exemplos acima são ilustrativos. A fonte é a especificação OpenAPI (Swagger) da aplicação; qualquer mudança nos endpoints deve atualizar este guia.
