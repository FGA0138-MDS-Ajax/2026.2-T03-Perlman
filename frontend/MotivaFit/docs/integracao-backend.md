# Integração com o backend

A base HTTP já suporta renovação coordenada de sessão, normalização de erros e descarte de respostas de uma sessão anterior. Cadastro, login, restauração de sessão, logout, guardas por perfil, consulta do catálogo, CRUD de treinos, ficha de exercícios, cópia de treino público, registro de execução, histórico paginado e indicadores pessoais já estão conectados. Os demais clientes serão conectados às telas nas próximas tarefas de [integração](../../../docs/integracao-front-back.md).

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
- `SESSION_CHANGED_EVENT` notifica os consumidores quando a identidade é limpa/trocada. O contexto de autenticação já acompanha esse evento e as renovações; remonta as telas quando a identidade muda. Consumidores de dados devem ignorar resultados `SESSAO_ALTERADA` e cancelar consultas desmontadas com `AbortSignal`.
- Cada tela deve distinguir carregamento, sucesso vazio, erro e envio em andamento; o cliente não transforma erros em arrays vazios. Esses estados já estão conectados aos formulários de autenticação e serão aplicados às demais funcionalidades.
- Erros HTTP mantêm `ApiError.status`, `code`, `message` e `occurredAt`. Falha de transporte usa `REDE_INDISPONIVEL` (status 0), JSON inválido usa `RESPOSTA_API_INVALIDA`, cookie ausente/malformado usa `CSRF_AUSENTE`/`CSRF_INVALIDO`. A causa técnica é preservada sem expô-la na mensagem pública. Cancelamento preserva o erro original do sinal.
- Não há repetição automática em falha de rede, inclusive em POST/PUT/DELETE: o servidor pode ter concluído a operação. A tela deve reconciliar o resultado ou usar idempotência quando suportada.
- A coordenação de refresh é por aba. Coordenação entre abas não está implementada; evitar restaurações simultâneas em múltiplas abas até definir essa política.

## Autenticação nas telas

- O cadastro envia somente e-mail e senha, exige a política do backend (12 caracteres, maiúscula, minúscula, número e símbolo) e encaminha ao login. O nome não é solicitado porque a API não o persiste.
- O contexto inicia em carregamento e restaura a sessão pelo refresh; as guardas aguardam essa verificação. O e-mail identifica a conta na interface.
- Os perfis `USUARIO`, `ADMINISTRADOR` e `SUPERUSUARIO` controlam menus e rotas. A área de superusuário é exclusiva desse perfil; autorização efetiva permanece no servidor.
- Tokens e permissões não são persistidos no navegador. `motivafit_user` e `motivafit_banco_admins` do protótipo são descartados. Preferências de tema são mantidas.
- A sessão é renovada antes da expiração, além da renovação por 401. Alterações de perfil refletidas pelo refresh atualizam as guardas. Falha encerra a sessão local; falha de logout informa quando a revogação remota não pôde ser confirmada.
- A promoção local de administradores foi removida. A tela de superusuário sinaliza que convites estarão disponíveis em entrega posterior. Recuperação de senha não possui implementação nesta entrega.

## Catálogo e treinos

- `GET /api/catalogo-exercicios` alimenta a consulta, com filtro local por nome, grupo muscular e modalidade. Os rótulos de `MUSCULACAO` e `AEROBICO` ficam só na apresentação. Não há meta padrão nem exercício pessoal: o catálogo global não possui esses campos, e esta tela não chama as rotas administrativas.
- `GET/POST /api/treinos` e `PUT/DELETE /api/treinos/{id}` substituem a lista local. A resposta inclui `meuTreino` e `podeEditar`. Ações de edição aparecem apenas quando `podeEditar` é verdadeiro. A exclusão pede confirmação e só altera a lista depois do sucesso.
- Datas do servidor são formatadas em `America/Sao_Paulo`. `@motivafit:treinos` e `@motivafit:meus-exercicios` são removidas ao abrir a tela.
- Na mesma tela, após criar ou atualizar o treino, a ficha envia inclusões, alterações de meta e remoções. O id da associação edita ou remove; `catalogoExercicioId` só identifica o item do catálogo. Falha no meio mantém o que já foi confirmado e a repetição não reenvia essa parte. A ordem exibida é a de inclusão.
- Treino público de outra pessoa oferece “Adicionar aos meus treinos” (`POST /api/treinos/{id}/adicionar`). A cópia é outro treino privado, sem recordes nem histórico. Inscrição, descrição e frequência das fichas locais continuam só no navegador.
- A tela de realizar treino envia cada exercício a `POST /api/registros`, com minutos convertidos para `tempoS`, carga em kg e distância em m. A chave de idempotência é reutilizada na repetição da mesma gravação. O histórico da página principal usa `GET /api/registros` com “Carregar mais”. Os indicadores percorrem todas as páginas e usam o fuso `America/Sao_Paulo`. Não há conclusão de sessão: cada linha é uma execução de exercício.

## Funcionalidades existentes e próximas integrações

Os clientes existentes cobrem autenticação, CRUD de treinos, catálogo, ficha de exercícios, cópia de treino público e execuções. Perfil editável, inscrições, sessões concluídas e relatórios agregados ainda exigem contratos novos. Convites administrativos continuam na entrega própria. Os painéis administrativos ainda leem o histórico local antigo.

`readJwtUsuarioClaims` apenas decodifica o JWT para apresentação. A autorização efetiva é responsabilidade do backend.

## Validação

No frontend (Node 22.18+ ou 24): `npm test`, `npm run build`, `npm run lint`. Os testes HTTP usam o runner nativo do Node; os testes de interface usam Vitest, Testing Library e jsdom. Ambos simulam respostas HTTP. `npm run test:http` e `npm run test:ui` permitem execução separada. Cobrem concorrência, isolamento, formulários, erros, expiração e guardas por perfil.

No backend, com Maven e JDK 25: `mvn -Dtest=AuthControllerTest,SecurityConfigTest test`. Validar também no navegador o ciclo login → refresh → logout no ambiente de destino; testes unitários não comprovam atributos de cookies aplicados por um navegador real.
