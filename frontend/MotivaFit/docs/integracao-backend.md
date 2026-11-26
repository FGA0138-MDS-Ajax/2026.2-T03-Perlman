# Integração com o backend

A base HTTP já suporta renovação coordenada de sessão, normalização de erros e descarte de respostas de uma sessão anterior. Cadastro, login (e-mail/senha e Google), restauração de sessão, logout, guardas por perfil, conta, preferências de tema, catálogo, CRUD de treinos, ficha de exercícios, cópia de treino público, registro de execução, histórico paginado, evolução pessoal, desafios, amizades, grupos, convites e métricas administrativas estão conectados à API. Nenhuma funcionalidade guarda dados de domínio no `localStorage` ou `sessionStorage`. As rotas que dependem da branch de backend estão listadas em "Dependências do backend".

## Desenvolvimento local

1. Copie `.env.example` para `.env.local` no frontend. Deixe `VITE_API_BASE_URL` vazio: o navegador chama `/api` na mesma origem.
2. Execute o backend na porta 8080 com suas variáveis de banco/JWT e `CORS_ALLOWED_ORIGIN=http://localhost:3000`. Para HTTP **somente no ambiente local**, configure `COOKIE_SECURE=false`. O padrão de `COOKIE_SECURE` é `true`.
3. Execute `npm run dev` no frontend (porta 3000). O proxy Vite encaminha `/api` para `API_PROXY_TARGET`, cujo padrão é `http://localhost:8080`, preservando a origem enviada pelo navegador.
4. Para executar o build com Docker, use o Compose único na raiz conforme [DOCKER.md](../../../DOCKER.md); a aplicação fica na porta 8080.

Não coloque credenciais em variáveis `VITE_*`: elas são incorporadas ao JavaScript público. Ao migrar uma sessão antiga, apague uma vez os cookies anteriores de `localhost`, pois o caminho do cookie CSRF mudou.

## Build e ambiente compartilhado

- `VITE_API_BASE_URL` é uma configuração de **build**, com padrão vazio. O Dockerfile/Compose aceitam esse argumento; mudar apenas uma variável no container já compilado não altera o bundle.
- Na imagem unificada, o nginx serve o frontend estático e encaminha `/api/` para `127.0.0.1:8081`, onde roda o backend.
- Coloque o frontend atrás do terminador HTTPS do ambiente e configure no backend `COOKIE_SECURE=true` e `CORS_ALLOWED_ORIGIN=https://<host-publico>` (origem exata, sem caminho ou barra final). Preserve o cabeçalho `Origin` através dos proxies. O container Nginx serve HTTP interno; certificados e DNS pertencem à infraestrutura do ambiente.
- O Compose da raiz publica HTTP em `http://localhost:8080`. Para autenticar localmente, use essa origem em `CORS_ALLOWED_ORIGIN` e `COOKIE_SECURE=false`.
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

- O cadastro envia somente e-mail e senha, exige a política do backend (mínimo de 6 caracteres, maiúscula, minúscula, número e símbolo) e encaminha ao login. O nome não é solicitado porque a API não o persiste.
- O contexto inicia em carregamento e restaura a sessão pelo refresh; as guardas aguardam essa verificação. O e-mail identifica a conta na interface.
- Os perfis `USUARIO`, `ADMINISTRADOR` e `SUPERUSUARIO` controlam menus e rotas. A área de superusuário é exclusiva desse perfil; autorização efetiva permanece no servidor.
- Tokens e permissões não são persistidos no navegador. `motivafit_user` e `motivafit_banco_admins` do protótipo são descartados.
- O tema da conta é lido e gravado em `GET/PUT /api/usuarios/me/preferencias`; visitantes escolhem o tema apenas em memória.
- Login com Google: com `VITE_GOOGLE_CLIENT_ID` definido no build (o mesmo client ID de `GOOGLE_CLIENT_ID` no backend), login e cadastro exibem o botão oficial do Google Identity Services. O ID Token é enviado a `POST /api/auth/google`, que cria a conta quando o e-mail é novo. Sem a variável, o botão não aparece.
- A sessão é renovada antes da expiração, além da renovação por 401. Alterações de perfil refletidas pelo refresh atualizam as guardas. Falha encerra a sessão local; falha de logout informa quando a revogação remota não pôde ser confirmada.
- Convites de administrador: o superusuário gera o token em `/admin/superusuario` (`POST /api/admin/convites`); a pessoa convidada o informa em "Minha conta" (`POST /api/admin/convites/aceite`) e a sessão é renovada para refletir o novo perfil. Recuperação de senha não possui implementação nesta entrega.
- "Minha conta" carrega `GET /api/conta/{id}` e exibe o ID da conta, usado para receber pedidos de amizade.

## Catálogo e treinos

- `GET /api/catalogo-exercicios` alimenta a consulta, com filtro local por nome, grupo muscular e modalidade. Os rótulos de `MUSCULACAO` e `AEROBICO` ficam só na apresentação. Não há meta padrão nem exercício pessoal: o catálogo global não possui esses campos, e esta tela não chama as rotas administrativas.
- `GET/POST /api/treinos` e `PUT/DELETE /api/treinos/{id}` substituem a lista local. A resposta inclui `meuTreino` e `podeEditar`. Ações de edição aparecem apenas quando `podeEditar` é verdadeiro. A exclusão pede confirmação e só altera a lista depois do sucesso.
- Datas do servidor são formatadas em `America/Sao_Paulo`. `@motivafit:treinos` e `@motivafit:meus-exercicios` são removidas ao abrir a tela.
- Na mesma tela, após criar ou atualizar o treino, a ficha envia inclusões, alterações de meta e remoções. O id da associação edita ou remove; `catalogoExercicioId` só identifica o item do catálogo. Falha no meio mantém o que já foi confirmado e a repetição não reenvia essa parte. A ordem exibida é a de inclusão.
- Treino público de outra pessoa oferece “Adicionar aos meus treinos”: abre um rascunho com nome e metas para revisão e, ao salvar, chama `POST /api/treinos/{id}/adicionar` (o que alimenta a métrica de treinos públicos mais adicionados). Em seguida o rascunho é associado aos exercícios copiados pelo servidor e só as diferenças são enviadas (alteração de meta, remoção ou inclusão). A cópia é outro treino privado, sem recordes nem histórico.
- A tela de realizar treino envia cada exercício a `POST /api/registros`, com minutos convertidos para `tempoS`, carga em kg e distância em m. A chave de idempotência é reutilizada na repetição da mesma gravação. O histórico da página principal usa `GET /api/registros` com “Carregar mais”. Os indicadores percorrem todas as páginas e usam o fuso `America/Sao_Paulo`. Não há conclusão de sessão: cada linha é uma execução de exercício.

## Histórico e evolução

- Em "Histórico", "Ver minha evolução" consulta `GET /api/metricas/evolucao` com exercício, período e agrupamento (dia, semana ou mês) e mostra execuções, carga máxima, volume, tempo, distância ou pace por período.

## Social

- **Amigos** (`/amigos`): `GET/POST /api/amizades` e `PATCH/DELETE /api/amizades/{id}`. Separa solicitações recebidas, enviadas e amizades aceitas. O envio localiza a conta pelo e-mail exato (`GET /api/usuarios/busca?email=`) antes de chamar `POST /api/amizades`.
- **Desafios** (`/desafios`): CRUD em `/api/desafios`, metas por exercício do catálogo conforme a modalidade (carga aceita zero; as demais metas precisam ser maiores que zero), prazo no fuso `America/Sao_Paulo` e visibilidade. O criador convida amigos ou qualquer conta pelo e-mail (`POST /participantes`); convidados aceitam ou recusam (`PATCH /participantes/me`); qualquer pessoa entra em desafio público (`POST /participantes/me`) e participantes podem sair (`DELETE /participantes/me`). O detalhe mostra o progresso de cada participante (`GET /progresso`). A chave `@motivafit:desafios` do protótipo é descartada; o antigo chat local foi removido.
- **Grupos** (`/grupos`): CRUD em `/api/grupos`, membros, convite de amigos e feed com publicações de texto (`POST /api/grupos/{id}/feed`). Os convites pendentes aparecem na tela (`GET /api/grupos/convites`) e são aceitos com um clique; o link `/grupos?convite=<token>` continua preenchendo o aceite (`POST /api/grupos/convites/aceite`).

## Administração

O painel administrativo exibe somente métricas gerais: nenhuma tela lista contas, e-mails, treinos de usuários ou valores por pessoa.

- Dashboard, Relatórios e Treinos usam apenas `/api/admin/metricas/usuarios-ativos`, `/rotinas` e `/exercicios-mais-realizados` (últimos 30 dias): contas cadastradas e ativas, treinos por tipo, percentuais de treinos públicos e de registros com treino, exercícios mais realizados e treinos públicos mais adicionados. "Execuções" somam apenas os exercícios do ranking.
- Relatórios exporta essas métricas agregadas em CSV (`metricas-motivafit.csv`); a exportação de contas foi removida da interface e do back-end.
- `/admin/metricas` mostra, por período, usuários ativos (com série), frequência média, tempo de treino (total, média e mediana por usuário ativo, sem ranking individual), exercícios mais realizados, rotinas e retenção por coorte semanal (ativação em 7 dias e retenção na 2ª e na 5ª semana). Cada seção carrega e falha de forma independente.
- Exercícios praticados por poucas pessoas são omitidos pelo backend para preservar a privacidade.

## Dependências do backend

As telas acima dependem das rotas da branch `feature/backend/integracao-front`: preferências, busca por e-mail, entrada e progresso em desafios, convites recebidos e feed de grupos e as métricas de série, coorte e rotinas corrigidas. Sem elas, essas ações retornam 404.

`readJwtUsuarioClaims` apenas decodifica o JWT para apresentação. A autorização efetiva é responsabilidade do backend.

## Validação

No frontend (Node 22.18+ ou 24): `npm test`, `npm run build`, `npm run lint`. Os testes HTTP usam o runner nativo do Node; os testes de interface usam Vitest, Testing Library e jsdom. Ambos simulam respostas HTTP; `tests/suporte-api.tsx` concentra os auxiliares das telas integradas e `tests/setup.ts` amplia o tempo de espera do Testing Library para a execução paralela. `npm run test:http` e `npm run test:ui` permitem execução separada. Cobrem concorrência, isolamento, formulários, erros, expiração e guardas por perfil.

No backend, com Maven e JDK 25: `mvn -Dtest=AuthControllerTest,SecurityConfigTest test`. Validar também no navegador o ciclo login → refresh → logout no ambiente de destino; testes unitários não comprovam atributos de cookies aplicados por um navegador real.
