# Registro de testes de fumaça da API

**Branch:** `test/smoke-api`  
**Escopo:** primeira verificação de integração entre o frontend/API contratada e o backend.  
**Data:** preencher com a data da execução pelo grupo.

## Objetivo

Verificar rapidamente se a API está disponível, se as rotas protegidas exigem autenticação, se o cadastro e o login funcionam e se um usuário autenticado consegue criar um treino.

## Casos executados

| ID | Caso | Esperado |
|---|---|---:|
| SMK-01 | `GET /api/treinos` sem token | `401 Unauthorized` |
| SMK-02 | Cadastro com e-mail e senha válidos | `201 Created` |
| SMK-03 | Login com senha incorreta | `401 Unauthorized` |
| SMK-04 | Login do usuário recém-cadastrado | `200 OK` e token no corpo |
| SMK-05 | Criação de treino autenticado | `201 Created` |
| SMK-06 | Listagem de treinos autenticada | `200 OK` |
| SMK-07 | Alteração de treino autenticada | `200 OK` |
| SMK-08 | Criação de treino sem nome | `400 Bad Request` |
| SMK-09 | Exclusão de treino autenticada | `204 No Content` |

## Utilidade dos casos adicionados

- **SMK-03:** confirma que o backend não aceita qualquer senha e diferencia credencial inválida de login válido.
- **SMK-06:** confirma que o token emitido no login pode ser usado em uma segunda rota protegida.
- **SMK-07:** verifica a operação de atualização e o vínculo do treino com o usuário autenticado.
- **SMK-09:** verifica a exclusão lógica de um treino sem depender de dados previamente existentes no banco.

## Execução

Com o backend disponível em `http://localhost:8080`:

```bash
python3 scripts/integration/test_api_smoke.py
```

No PowerShell:

```powershell
$env:BASE_URL = "http://localhost:8080"
$env:TEST_USER_PASSWORD = "SenhaTeste123!"
py scripts\integration\test_api_smoke.py
```

## Resultado

Preencher após a execução:

```text
Resultado: __/9 testes aprovados
Status: APROVADO / REPROVADO
Observações: ______________________________
```

## Limites desta rodada

Esta é uma rodada de fumaça, não uma suíte completa. Ela não cobre ainda exercícios, registros diários, refresh/logout, painel administrativo, testes de navegador ou persistência após reinicialização. Esses casos podem ser adicionados em commits posteriores, depois que esta integração básica estiver estável.
