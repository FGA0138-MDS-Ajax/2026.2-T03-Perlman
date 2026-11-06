# Integração com o backend

A base HTTP já suporta renovação coordenada de sessão, normalização de erros e descarte de respostas de uma sessão anterior. Os clientes ainda precisam ser conectados às telas nas próximas tarefas de [integração](../../../docs/integracao-front-back.md).

## Desenvolvimento local

1. Copie `.env.example` para `.env.local` no frontend. Deixe `VITE_API_BASE_URL` vazio: o navegador chama `/api` na mesma origem.
2. Execute o backend na porta 8080 com suas variáveis de banco/JWT e `CORS_ALLOWED_ORIGIN=http://localhost:3000`. Para HTTP **somente no ambiente local**, configure `COOKIE_SECURE=false`. O Compose de desenvolvimento do backend já usa esse padrão; fora dele o padrão é `true`.
3. Execute `npm run dev` no frontend (porta 3000). O proxy Vite encaminha `/api` para `API_PROXY_TARGET`, cujo padrão é `http://localhost:8080`, preservando a origem enviada pelo navegador.
4. Alternativamente, `docker compose -f docker-compose.dev.yml up` usa a mesma porta 3000 e encaminha a API para a porta 8080 do host via `host.docker.internal`.

Não coloque credenciais em variáveis `VITE_*`: elas são incorporadas ao JavaScript público. Ao migrar uma sessão antiga, apague uma vez os cookies anteriores de `localhost`, pois o caminho do cookie CSRF mudou.

## Build e ambiente compartilhado

- `VITE_API_BASE_URL` é uma configuração de **build**, com padrão vazio. O Dockerfile/Compose aceitam esse argumento; mudar apenas uma variável no container já compilado não altera o bundle.
- O Nginx encaminha `/api/` para `host.docker.internal:8080`; o Compose configura esse nome no Linux. Essa topologia pressupõe backend publicado na porta 8080 do mesmo host Docker. Para outro destino, ajuste `proxy_pass`.
- Coloque o frontend atrás do terminador HTTPS do ambiente e configure no backend `COOKIE_SECURE=true` e `CORS_ALLOWED_ORIGIN=https://<host-publico>` (origem exata, sem caminho ou barra final). Preserve o cabeçalho `Origin` através dos proxies. O container Nginx serve HTTP interno; certificados e DNS pertencem à infraestrutura do ambiente.
- O Compose do frontend publica HTTP em `http://localhost:4173` para inspeção local do build. Para autenticar nesse endereço, o backend local deve usar essa origem e `COOKIE_SECURE=false`.
- Refresh e CSRF usam `SameSite=Lax`. O refresh é `HttpOnly`, com `Path=/api/auth`; CSRF é legível, com `Path=/`. O logout expira cada cookie no respectivo caminho.
- Evite API em outro host: CORS não torna o cookie CSRF acessível ao JavaScript do frontend. Prefira o proxy sob a mesma origem.

## Contrato do cliente HTTP

- `apiRequest` envia cookies e, em chamadas protegidas, o access token mantido em memória. Não persiste tokens em `localStorage`.
- Um 401 protegido com token de acesso aciona um único refresh compartilhado entre chamadas concorrentes nesta aba. A chamada original é repetida no máximo uma vez; um segundo 401 limpa a sessão. Login/cadastro/refresh/logout nunca acionam essa repetição.
- Sem access token, a restauração exige chamada explícita a `refreshSession` durante a inicialização do contexto; uma consulta após logout não restaura a sessão implicitamente.
- `refreshSession`, exportado também por `auth-api.ts`, compartilha a mesma operação usada na renovação automática. Falha na renovação limpa o token e propaga o erro.
- Login/logout aguardam uma rotação já iniciada antes de alterar cookies. Limpar/trocar o token invalida respostas pendentes da sessão anterior, com `SESSAO_ALTERADA`.
- `SESSION_CHANGED_EVENT` notifica os consumidores quando a identidade é limpa/trocada. Ao conectar o contexto de autenticação nas próximas tarefas, limpar os dados da conta nesse evento, ignorar resultados `SESSAO_ALTERADA` e cancelar consultas desmontadas com `AbortSignal`.
- Cada tela deve distinguir carregamento, sucesso vazio, erro e envio em andamento; o cliente não transforma erros em arrays vazios. Esses estados visuais serão conectados junto de cada funcionalidade.
- Erros HTTP mantêm `ApiError.status`, `code`, `message` e `occurredAt`. Falha de transporte usa `REDE_INDISPONIVEL` (status 0), JSON inválido usa `RESPOSTA_API_INVALIDA`, cookie ausente/malformado usa `CSRF_AUSENTE`/`CSRF_INVALIDO`. A causa técnica é preservada sem expô-la na mensagem pública. Cancelamento preserva o erro original do sinal.
- Não há repetição automática em falha de rede, inclusive em POST/PUT/DELETE: o servidor pode ter concluído a operação. A tela deve reconciliar o resultado ou usar idempotência quando suportada.
- A coordenação de refresh é por aba. Coordenação entre abas não está implementada; evitar restaurações simultâneas em múltiplas abas até definir essa política.

## Funcionalidades existentes e próximas integrações

Os clientes existentes cobrem autenticação, CRUD de treinos e catálogo. O backend também possui exercícios de ficha, registros diários, cópia de treino público e convites; seus clientes/telas e correções de autorização estão detalhados no plano. Perfil editável, inscrições, sessões concluídas e relatórios agregados ainda exigem contratos novos.

`readJwtUsuarioClaims` apenas decodifica o JWT para apresentação. A autorização efetiva é responsabilidade do backend.

## Validação

No frontend (Node 22.18+ ou 24): `npm test`, `npm run build`, `npm run lint`. Os testes HTTP usam o runner nativo do Node e respostas simuladas, cobrindo concorrência, isolamento de sessão, erros e cancelamento.

No backend, com Maven e JDK 25: `mvn -Dtest=AuthControllerTest,SecurityConfigTest test`. Validar também no navegador o ciclo login → refresh → logout no ambiente de destino; testes unitários não comprovam atributos de cookies aplicados por um navegador real.
