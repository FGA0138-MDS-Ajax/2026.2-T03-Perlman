# Relatório de Testes da API

Resultado da primeira rodada de testes da API do MotivaFit e situação dos pontos levantados nela, conferida no repositório em 18/11/2026.

## Identificação

| Campo | Informação |
| :-- | :-- |
| **Data da execução** | 09/11/2026 |
| **Executor** | Bernardo Campos Caxito Silveira (GQM / Analista de Qualidade) |
| **Branch testada** | `test/smoke-api` |
| **Ambiente** | Local, pelo WSL, com o back-end em `http://localhost:8080`, PostgreSQL local e origem configurada como `http://localhost:3000` |
| **Método** | Chamadas diretas à API com `curl` |
| **Relatório detalhado** | [Relatório de feedback — testes da API MotivaFit](Relato%CC%81rio%20de%20feedback%20%E2%80%94%20testes%20da%20API%20MotivaFit.md) |

## Escopo e limites

Os testes validam a integração entre o back-end e o banco de dados, os contratos HTTP e a autenticação.

Eles **não** são testes completos de integração entre front-end e back-end: o front-end ainda não foi iniciado pela interface, e as chamadas não foram conferidas na aba Network do navegador.

## Testes executados

| Nº | ID no relatório detalhado | Caso | Resultado | Retorno |
| :-: | :-: | :-- | :-: | :-- |
| 1 | T02 | `GET /v3/api-docs` | Aprovado | 200 e especificação OpenAPI |
| 2 | T03 | Cadastro com e-mail novo e senha válida | Aprovado | 201 |
| 3 | T04 | Cadastro com senha fraca | Aprovado | 400 com a mensagem de validação esperada |
| 4 | T05 | Login com credenciais válidas | Aprovado | 200, JWT e data de expiração |
| 5 | T07 | `GET /api/treinos` sem token | Aprovado | 401 |
| 6 | T08 | `GET /api/treinos` autenticado | Aprovado | 200 e lista de treinos |
| 7 | T09 | Criação autenticada de treino | Aprovado | 201, treino criado com `id: 1` |
| 8 | T10 | Respostas com a origem `http://localhost:3000` | Aprovado | `Access-Control-Allow-Origin` compatível com o front-end |

**Resultado:** 8 de 8 verificações aprovadas.

A criação de treino (caso 7) valida a API com autenticação e persistência no banco. Para ser um teste entre front-end e back-end, o fluxo precisa ser repetido pela tela do front-end.

## Relação com o registro de testes de fumaça

O [registro de testes de fumaça](Registro%20de%20testes%20de%20fumac%CC%A7a%20da%20API.md) define nove casos (`SMK-01` a `SMK-09`) e continua com a data e o resultado em branco. Esta rodada cobre cinco deles:

| Caso de fumaça | Coberto por | Situação |
| :-- | :-: | :-- |
| SMK-01 — `GET /api/treinos` sem token | Caso 5 | Coberto |
| SMK-02 — Cadastro com e-mail e senha válidos | Caso 2 | Coberto |
| SMK-03 — Login com senha incorreta (401) | — | **Não coberto** |
| SMK-04 — Login do usuário recém-cadastrado | Caso 4 | Coberto |
| SMK-05 — Criação de treino autenticado | Caso 7 | Coberto |
| SMK-06 — Listagem de treinos autenticada | Caso 6 | Coberto |
| SMK-07 — Alteração de treino autenticada (200) | — | **Não coberto** |
| SMK-08 — Criação de treino sem nome (400) | — | **Não coberto** |
| SMK-09 — Exclusão de treino autenticada (204) | — | **Não coberto** |

Os 22 casos do [Roteiro de Teste](roteiro.md) (T1 a T22) continuam como "Não executado": esta rodada ainda não foi registrada neles.

## Pontos para ajuste ou confirmação

Os cinco pontos do relatório e a situação de cada um na branch `developer` em 18/11/2026 (commit `8d27ae3`):

| Nº | Ponto levantado | Situação no repositório |
| :-: | :-- | :-- |
| 1 | `frontend/MotivaFit/src/pages-user/pagina-principal.tsx` com marcadores de conflito do Git (`<<<<<<< HEAD`, `=======`, `>>>>>>> developer`) | **Resolvido.** A issue #15 foi fechada em 16/11, e não há marcadores de conflito na `developer`. |
| 2 | Após resolver, executar a busca por marcadores, `npm run build` e `npm run lint` | **Verificado.** `npm run build` conclui sem erros; `npm run lint` não aponta erros e registra 10 avisos. |
| 3 | Confirmar que a camada de API do front-end aponta para `http://localhost:8080` e não para a porta 3000 | **Confirmado.** O front-end usa `VITE_API_BASE_URL` vazio com um proxy do Vite para `http://localhost:8080` (`API_PROXY_TARGET`). |
| 4 | Confirmar que login, cadastro e treinos chamam a camada de API em vez de usar só `localStorage` | **Confirmado em parte.** Login, cadastro, treinos e histórico usam a camada de API: `workout-history.ts`, `workout-enrollments.ts` e `workout-plans.ts` foram removidos em 11/11. Continuam só no navegador (`localStorage`) os desafios (`pagina-desafios.tsx`, criada em 16/11, sem endpoint no back-end) e as preferências de tema (`preferencias-api.ts`). |
| 5 | Comprovar o cadastro duplicado (409) e a listagem após a criação do treino | **Pendente.** Falta uma nova execução; o ponto está registrado na issue #18. |

O defeito do ponto 1 foi o único identificado nesta rodada e está corrigido.

## Próximos passos

1. Repetir o fluxo de cadastro, login e criação de treino **pela tela do front-end**, conferindo as requisições na aba Network.
2. Executar os casos de fumaça ainda não cobertos (`SMK-03`, `SMK-07`, `SMK-08` e `SMK-09`) e preencher o resultado do registro.
3. Comprovar o cadastro duplicado (esperado 409) e a listagem de treinos depois da criação.
4. Registrar os resultados no [Roteiro de Teste](roteiro.md), associando-os aos casos T1 a T22.

---

*Esta página resume a rodada. Os detalhes de cada caso estão no [relatório detalhado](Relato%CC%81rio%20de%20feedback%20%E2%80%94%20testes%20da%20API%20MotivaFit.md), e os casos de fumaça, no [registro de testes de fumaça](Registro%20de%20testes%20de%20fumac%CC%A7a%20da%20API.md).*
