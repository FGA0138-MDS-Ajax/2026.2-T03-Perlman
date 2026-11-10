# Relatório de Testes da API

Resultado da primeira rodada de testes da API do MotivaFit, com a verificação dos pontos levantados no relatório contra o repositório.

## Identificação

| Campo | Informação |
| :-- | :-- |
| **Data da execução** | 08/11/2026 |
| **Executor** | Bernardo Campos Caxito Silveira (GQM / Analista de Qualidade) |
| **Branch testada** | `test/smoke-api` |
| **Ambiente** | Local, pelo WSL, com o back-end em `http://localhost:8080`, PostgreSQL local e origem configurada como `http://localhost:3000` |
| **Método** | Chamadas diretas à API com `curl` |

## Escopo e limites

Os testes validam a integração entre o back-end e o banco de dados, os contratos HTTP e a autenticação.

Eles **não** são testes completos de integração entre front-end e back-end: o front-end ainda não foi iniciado pela interface, e as chamadas não foram conferidas na aba Network do navegador.

## Testes executados

| Nº | Caso | Resultado | Retorno |
| :-: | :-- | :-: | :-- |
| 1 | `GET /v3/api-docs` | Aprovado | 200 e especificação OpenAPI |
| 2 | Cadastro com e-mail novo e senha válida | Aprovado | 201 |
| 3 | Cadastro com senha fraca | Aprovado | 400 com a mensagem de validação esperada |
| 4 | Login com credenciais válidas | Aprovado | 200, JWT e data de expiração |
| 5 | `GET /api/treinos` sem token | Aprovado | 401 |
| 6 | `GET /api/treinos` autenticado | Aprovado | 200 e lista de treinos |
| 7 | Criação autenticada de treino | Aprovado | 201, treino criado com `id: 1` |
| 8 | Respostas com a origem `http://localhost:3000` | Aprovado | `Access-Control-Allow-Origin` compatível com o front-end |

**Resultado:** 8 de 8 verificações aprovadas.

A criação de treino (caso 7) valida a API com autenticação e persistência no banco. Para ser um teste entre front-end e back-end, o fluxo precisa ser repetido pela tela do front-end.

## Relação com o registro de testes de fumaça

O registro de fumaça (`docs/testes/registro-smoke-api.md`, na branch `test/smoke-api`) define cinco casos (`SMK-01` a `SMK-05`) e continua com a data e o resultado em branco. Esta rodada cobre quatro deles:

| Caso de fumaça | Coberto por | Situação |
| :-- | :-: | :-- |
| SMK-01 — `GET /api/treinos` sem token | Caso 5 | Coberto |
| SMK-02 — Cadastro válido | Caso 2 | Coberto |
| SMK-03 — Login do usuário cadastrado | Caso 4 | Coberto |
| SMK-04 — Criação de treino autenticado | Caso 7 | Coberto |
| SMK-05 — Criação de treino sem nome (400) | — | **Não coberto** |

Os 22 casos do [Roteiro de Teste](roteiro.md) (T1 a T22) continuam como "Não executado": esta rodada ainda não foi registrada neles.

## Pontos para ajuste ou confirmação

Os cinco pontos do relatório e a situação de cada um no repositório em 09/11/2026:

| Nº | Ponto levantado | Situação no repositório |
| :-: | :-- | :-- |
| 1 | `frontend/MotivaFit/src/pages-user/pagina-principal.tsx` com marcadores de conflito do Git (`<<<<<<< HEAD`, `=======`, `>>>>>>> developer`) | **Confirmado** na branch `developer` (linhas 148 a 164) e, por consequência, na `test/smoke-api`. **Já corrigido** na branch `integracao` pelo commit `150abe5`, de 05/11. |
| 2 | Após resolver, executar a busca por marcadores, `npm run build` e `npm run lint` | **Não verificado.** Na `integracao`, os 36 testes de interface do front-end passam, mas o build e o lint não foram executados. |
| 3 | Confirmar que a camada de API do front-end aponta para `http://localhost:8080` e não para a porta 3000 | **Confirmado.** O front-end usa `VITE_API_BASE_URL` vazio com um proxy do Vite para `http://localhost:8080` (`API_PROXY_TARGET`). |
| 4 | Confirmar que login, cadastro e treinos chamam a camada de API em vez de usar só `localStorage` | **Confirmado em parte.** Login e cadastro usam `auth-api`, e as telas de treinos importam a camada de API. O histórico e as matrículas de treino ainda usam `localStorage` (`workout-history.ts`, `workout-enrollments.ts`). |
| 5 | Comprovar o cadastro duplicado (409) e a listagem após a criação do treino | **Pendente.** Falta uma nova execução. |

O defeito do ponto 1 é o único identificado nesta rodada e já está corrigido na branch de integração.

## Próximos passos

1. Repetir o fluxo de cadastro, login e criação de treino **pela tela do front-end**, conferindo as requisições na aba Network.
2. Executar o caso de fumaça `SMK-05` (treino sem nome, esperado 400).
3. Comprovar o cadastro duplicado (esperado 409) e a listagem de treinos depois da criação.
4. Rodar `npm run build` e `npm run lint` na branch de integração.
5. Registrar os resultados no [Roteiro de Teste](roteiro.md), associando-os aos casos T1 a T22.

---

*Esta página resume o relatório em PDF "Feedback dos testes MotivaFit". O relatório detalhado citado nele (`Relatorio-Feedback-Testes-API-MotivaFit.md`) ainda não foi incorporado à documentação.*
