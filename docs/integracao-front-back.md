# Plano de integração entre frontend e backend

Data da análise: 05/11/2026. Escopo: planejar a integração do MotivaFit por funcionalidade, com base no código atual. O diagnóstico inicial descreve a situação em 05/11/2026; as notas de implementação e os checkboxes registram o progresso posterior.

## 1. Diagnóstico e premissas

O frontend React/TypeScript está em `frontend/MotivaFit`; o backend Spring Boot está em `backend/MotivaFIt`. Os caminhos nas seções abaixo são relativos a essas pastas, salvo indicação contrária.

- As telas usam estado local, listas fixas e `localStorage`. Login e cadastro locais não validam a senha no servidor; os privilégios administrativos são derivados de uma lista de e-mails no navegador.
- Já existem clientes reutilizáveis em `src/lib/api/`: `http-client.ts`, `auth-api.ts`, `treinos-api.ts`, `catalogo-exercicios-api.ts` e `contracts.ts`. Eles ainda precisam ser conectados às telas.
- `src/App.tsx` não registra `pagina-treinos.tsx`; a página principal usa fichas fixas de `workout-plans.ts`. É necessário conectar a navegação ao editor de treinos.
- A documentação `frontend/MotivaFit/docs/integracao-backend.md` está parcialmente desatualizada: o backend já possui controllers de exercícios, registros diários e convites administrativos. Atualizá-la durante a implementação.
- Inscrição em ficha, cópia de treino público, execução de exercício e conclusão de sessão são conceitos diferentes. Não converter um no outro silenciosamente.
- Rotas explicitamente marcadas como **propostas** neste plano ainda precisam ser implementadas e ter seus contratos definidos. As demais foram identificadas no código; sua presença não comprova funcionamento em ambiente integrado.

## 2. Sequência de entrega

| Ordem | Entrega | Dependências |
| --- | --- | --- |
| 1 | Base HTTP, cookies, erros e configuração | Nenhuma |
| 2 | Cadastro, login, restauração de sessão e perfis — implementado | 1 |
| 3 | Consulta de catálogo e CRUD de treinos — implementado | 2; identificação de propriedade do treino |
| 4 | Exercícios da ficha e cópia de treinos públicos — implementado | 3; correções de autorização e persistência |
| 5 | Registros de execução, histórico e indicadores pessoais — implementado | 4; decisão sobre sessão concluída |
| 6 | Convites e manutenção administrativa do catálogo — pendente | 2 e 3; correções de identidade nos convites |
| 7 | Inscrições, gestão de alunos e relatórios globais — pendente; parte sem contrato no backend | Contratos novos; decisão sobre inscrições e sessões |
| 8 | Remoção dos fluxos locais e validação integrada — pendente | Funcionalidades do escopo escolhido prontas |

As entregas 5 e 6 podem avançar independentemente após suas dependências. Cada entrega deve reunir contrato, backend quando necessário, cliente, tela e validação funcional. O inventário do que ainda falta, conferido no código em 06/11/2026, está na seção 17.

## 3. Base compartilhada de integração

**Arquivos:** `src/lib/api/http-client.ts`, `contracts.ts`, `vite.config.ts`, `nginx.conf`; backend `config/SecurityConfig.java` e `controller/AuthController.java`.

- [x] Configurar `VITE_API_BASE_URL` por ambiente e `CORS_ALLOWED_ORIGIN` com a origem exata do navegador. O Vite usa a porta 3000; o cliente usa a mesma origem como padrão, com proxy para o backend na porta 8080. Variáveis `VITE_*` são públicas e não devem conter segredos.
- [x] Definir HTTPS e encaminhamento de `/api` no ambiente compartilhado, preferencialmente sob a mesma origem do frontend. O Nginx encaminha `/api` ao backend; HTTPS termina no proxy de entrada do ambiente. Definir a URL da API no build do Vite.
- [x] Corrigir a acessibilidade do cookie CSRF: o cookie antigo usava `Path=/api/auth`, mas o frontend o lê com `document.cookie` em páginas como `/principal`. Usar `Path=/` para esse cookie e ajustar sua expiração no logout. Manter o refresh token `HttpOnly` restrito a `/api/auth`.
- [x] Verificar também o host dos cookies: JavaScript do frontend não lê cookies de outro host. CORS sozinho não resolve isso. Preferir a mesma origem; se houver hosts distintos, definir explicitamente outra entrega segura do token CSRF.
- [x] Preservar `credentials: include`, `Secure`, a política de `SameSite` apropriada à topologia e a validação de `Origin`/`X-CSRF-TOKEN` do backend. Definir configuração local compatível, sem depender de exceções específicas do navegador para HTTP.
- [x] Centralizar erro de rede, `ApiError`, respostas inválidas e estados 400/401/403/404/409/500. Não converter indisponibilidade em lista vazia ou sucesso local.
- [x] Implementar renovação compartilhada de sessão: uma requisição de refresh por vez, no máximo uma repetição da chamada protegida após 401, sem recursão em login/refresh/logout. Não repetir mutações automaticamente após falhas de rede ambíguas.
- [ ] Usar estados de carregamento, vazio, erro recuperável e envio em andamento; limpar dados da conta anterior no logout/troca de usuário e descartar respostas atrasadas.

**Implementação em 05/11/2026:** base HTTP/configuração concluída, com testes automatizados de concorrência, falhas, isolamento de sessão e cookies. Os estados visuais e a limpeza por mudança de identidade foram conectados à autenticação na tarefa 2; as demais funcionalidades devem aplicar o mesmo cuidado ao serem integradas. O aceite completo no navegador e a instalação de HTTPS dependem do ambiente de destino. Consulte [configuração e limites](../frontend/MotivaFit/docs/integracao-backend.md).

**Aceite:** login, refresh e logout funcionam no navegador na topologia escolhida; múltiplos 401 simultâneos não provocam várias rotações do refresh; erros são exibidos sem dados fictícios.

## 4. Cadastro de conta

**Tela/cliente:** `pages-user/pagina-cadastro.tsx`, `lib/auth-context.tsx`, `lib/api/auth-api.ts`.

**Contrato existente:** `POST /api/auth/cadastro`, corpo `{ email, senha }`, resposta `UsuarioResponseDTO` com `id`, `email`, `perfil`, `ativo`.

- [x] Tornar o cadastro assíncrono e chamar `registerAccount`; não criar identidade usando `Date.now()`.
- [x] Alinhar validação de senha: tela e backend exigem pelo menos seis caracteres, com maiúscula, minúscula, número e símbolo. Manter confirmação de senha apenas na interface.
- [x] Resolver o campo nome: a tela o exige, mas a API não o recebe nem retorna. Decisão aplicada nesta entrega: remover o campo de nome e exibir e-mail; se nome persistido for requisito, adicionar campo, migration e DTOs antes de anunciá-lo como salvo.
- [x] Após cadastro, encaminhar para login. Caso seja adotado login automático, executar uma chamada real de login; a resposta do cadastro não contém token.
- [x] Tratar validação e e-mail duplicado sem perder o formulário ou navegar em caso de falha.

**Implementação da tarefa 2:** formulário conectado à API, validação de senha alinhada ao mínimo de seis caracteres e encaminhamento ao login após sucesso; erros mantêm o formulário.

**Aceite:** conta persistida permite login após recarregar a página; senha inválida e e-mail duplicado não criam sessão local.

## 5. Login, logout, sessão e autorização da interface

**Arquivos:** `pages-user/pagina-login.tsx`, `lib/auth-context.tsx`, `App.tsx`, `components/admin-layout.tsx` e pontos de logout.

**Contratos existentes:** `POST /api/auth/login` com `{ email, senha }`; `POST /api/auth/refresh`; `POST /api/auth/logout`. Login/refresh retornam `{ token, expirationAt }`; logout retorna 204.

- [x] Substituir `login`, `cadastro` e `logout` síncronos do contexto por operações assíncronas e adaptar seus consumidores.
- [x] Manter access token em memória, usando o cliente existente; restaurar sessão no carregamento via refresh e cookies. Distinguir inicialização, autenticado e não autenticado para evitar redirecionamentos prematuros.
- [x] Usar `id`, `sub`, `perfil` e `ativo` das claims para apresentação. `readJwtUsuarioClaims` apenas decodifica o JWT; a autorização continua no servidor.
- [x] Representar os três perfis `USUARIO`, `ADMINISTRADOR` e `SUPERUSUARIO`. Remover `BANCO_ADMINS_PADRAO`, `isEmailAdmin` e a lista local como fonte de permissão.
- [x] Criar guarda específica de superusuário para `/admin/superusuario`, hoje protegida apenas por `RotaAdmin`, e ajustar menus.
- [x] No logout, limpar token, contexto e dados da conta mesmo se houver erro, mas informar quando não for possível confirmar a revogação remota.
- [x] Não restaurar autenticação a partir de `motivafit_user`. Planejar descarte das chaves de autenticação do protótipo.
- [x] Tratar “Esqueceu a senha?” como recurso pendente: não há fluxo de recuperação identificado. A liberação de `/api/auth/google` no SecurityConfig também não significa que exista implementação de login Google.

**Implementação da tarefa 2:** contexto assíncrono com restauração via refresh, atualização de perfil em cada renovação, renovação antes da expiração e guardas para os três perfis. As chaves locais antigas de identidade/permissão são removidas. Ao trocar a identidade, as telas são remontadas para descartar estado da conta anterior. Convites administrativos permanecem na entrega específica; a concessão fictícia local foi removida e a tela informa indisponibilidade. Recuperação de senha também está sinalizada como pendente.

**Validação:** testes de interface com React/Vitest e HTTP simulado cobrem formulários, restauração em StrictMode, falhas, logout e restrições por perfil. Testes do backend verificam requisições diretas sem sessão e permissões administrativas. O teste ponta a ponta em navegador real com os dois serviços continua pendente.

**Aceite:** senha incorreta falha; recarga restaura sessão válida; expiração encerra sessão sem loop; usuário comum não abre áreas administrativas; administrador não abre a área de superusuário. Requisições diretas também respeitam permissões no servidor.

## 6. Perfil e identificação do usuário

**Estado atual:** não há endpoint de perfil atual/editável; os DTOs não incluem nome. O cadastro não fornece dados suficientes para as colunas administrativas de nome/data de cadastro.

- [ ] Para a primeira entrega, usar identidade real do JWT e e-mail como identificação visual.
- [ ] Se perfil editável fizer parte do escopo, definir **propostas** `GET /api/usuarios/me` e `PATCH /api/usuarios/me`, campos permitidos, validação e persistência de nome.
- [ ] Impedir alteração de perfil de autorização pelo endpoint de edição pessoal; definir processo separado para e-mail/senha se necessário.

**Aceite:** a identidade exibida corresponde à conta autenticada; nenhum campo aparece como persistido se estiver apenas no navegador.

## 7. Catálogo de exercícios

**Tela/cliente:** seletores de `pages-user/pagina-treinos.tsx` e `lib/api/catalogo-exercicios-api.ts`.

**Contratos existentes:** `GET /api/catalogo-exercicios` e `GET /api/catalogo-exercicios/{id}`, autenticados. Resposta: `id`, `nome`, `modalidade`, `grupoMuscular`.

- [x] Trocar `CATALOGO_MOTIVAFIT` por consulta real e manter filtros de nome/grupo/modalidade.
- [x] Mapear `MUSCULACAO`/`AEROBICO` para rótulos da interface; manter IDs numéricos nos contratos e conversão explícita onde a UI usa strings.
- [x] Não inferir do catálogo `metaPadrao`, `metaRecordePadrao` ou `origem`: esses campos locais não existem no DTO. Metas devem ser informadas na ficha ou receber padrões de apresentação claramente definidos.
- [x] Resolver “Meus exercícios”: criação pessoal não é suportada pelo catálogo global atual. Proposta inicial: restringir o usuário comum à seleção do catálogo; se criação pessoal for requisito, implementar propriedade, visibilidade e rotas próprias antes de habilitá-la.

**Aceite:** itens vêm do servidor, filtros funcionam e indisponibilidade oferece nova tentativa; usuário comum não ganha permissão de escrita no catálogo global.

## 8. Criar, listar, editar e excluir treinos

**Tela/cliente:** `pages-user/pagina-treinos.tsx`, `pages-user/pagina-principal.tsx`, `App.tsx`, `lib/api/treinos-api.ts`.

**Contratos existentes:** `GET/POST /api/treinos`; `GET/PUT/DELETE /api/treinos/{id}`. Escrita recebe `{ nome, tipo, visibilidade? }`; resposta inclui `id`, `nome`, `tipo`, `visibilidade`, `createdAt`, `updatedAt`. Exclusão é lógica.

- [x] Registrar uma rota protegida para o editor, por exemplo `/treinos`, e conectar os links da página principal.
- [x] Substituir `TREINOS_INICIAIS` e `@motivafit:treinos` pelas operações do cliente existente.
- [x] Separar visualmente treinos próprios e públicos de terceiros: a listagem atual retorna ambos, mas o DTO não informa propriedade. Acrescentar indicador como `meuTreino`/`podeEditar` ou separar consultas no backend antes de exibir ações de edição.
- [x] Enviar enums e visibilidade reais; usar datas ISO retornadas pelo servidor e formatá-las apenas na apresentação.
- [ ] Integrar a composição de exercícios conforme a seção seguinte. `TreinoResponseDTO` não contém a lista de exercícios.
- [x] Confirmar exclusão e atualizar a listagem apenas após sucesso. A edição/exclusão de treino de terceiros deve continuar bloqueada no backend, inclusive quando público.

**Implementação da tarefa 3:** a resposta de treino informa `meuTreino` e `podeEditar`, hoje equivalentes à propriedade. A tela `/treinos` consulta o catálogo ativo e faz o CRUD do cabeçalho pela API, com carregamento, vazio, erro recuperável e envio único. Datas ISO são formatadas em `America/Sao_Paulo`. As chaves locais `@motivafit:treinos` e `@motivafit:meus-exercicios` são descartadas. A página principal aponta para o editor. Na mesma tela, depois de gravar o cabeçalho, o frontend associa cada exercício escolhido em `POST /api/treinos/{id}/exercicios`. A meta é informada na ficha. Alteração, remoção e a checagem de dono ficaram para a tarefa 4.

**Aceite:** CRUD persiste após recarga e nova sessão; treino público de terceiros é consultável, mas não editável; treino arquivado sai da listagem e seus registros históricos permanecem. O ciclo no navegador com os dois serviços continua pendente.

## 9. Exercícios associados ao treino e metas

**Backend existente:** `ExercicioController` e `ExercicioService`; `GET/POST /api/treinos/{treinoId}/exercicios`. Corpo de criação: `{ meta, metaRecorde?, treinoId, catalogoExercicioId }`; resposta inclui ID da associação e os mesmos campos.

**Bloqueadores identificados:** o controller não aplica `@Valid`; o serviço não recebe o usuário autenticado nem verifica propriedade/visibilidade do treino. Não existem rotas de atualização/exclusão da associação.

- [x] Antes de conectar a escrita, receber o principal autenticado e validar leitura de treino próprio/público, escrita apenas no próprio, exclusão lógica do treino e catálogo ativo. Validar coerência entre `treinoId` da URL e do corpo, ou remover a duplicidade do contrato.
- [x] Aplicar `@Valid` e substituir `RuntimeException` genérica por erros de aplicação com status e mensagens adequados.
- [x] Implementar **propostas** `PUT/DELETE /api/treinos/{treinoId}/exercicios/{id}`, garantindo que a associação pertença ao treino autorizado e que a remoção preserve o histórico.
- [x] Criar `src/lib/api/exercicios-api.ts`; usar o ID da associação para editar/remover e `catalogoExercicioId` para obter nome/grupo. Não confundir os dois IDs.
- [x] Ao salvar a ficha, persistir cabeçalho e inclusões/alterações/remoções. Definir tratamento de falha parcial: manter rascunho e IDs já confirmados, mostrar pendências e evitar duplicar itens na repetição. Se o requisito for salvamento integral, criar operação transacional de ficha completa no backend.
- [x] Definir ordenação persistida caso a ordem dos exercícios seja relevante; o contrato atual não possui campo de posição.

**Implementação da tarefa 4:** leitura exige treino próprio ou público e não excluído. Escrita exige treino do usuário autenticado, não excluído, e item de catálogo ativo. `treinoId` do corpo precisa coincidir com a URL. A alteração muda meta e recorde; trocar `catalogoExercicioId` responde 400. A remoção apaga a associação. O registro diário permanece: a chave estrangeira usa `ON DELETE SET NULL` e o nome do exercício já está gravado no registro. Não há salvamento transacional da ficha inteira: o que foi confirmado fica no rascunho e a repetição não reenvia inclusão, alteração nem remoção já concluídas. A ordem não é requisito; a lista vem por id crescente, sem coluna de posição.

**Aceite:** ficha recarrega com suas metas e exercícios; falha intermediária não é anunciada como sucesso integral; outra conta não consulta exercícios de treino privado nem altera associações de terceiros; remoção não destrói registros anteriores.

## 10. Treinos públicos, templates e inscrições em fichas

**Existente:** `POST /api/treinos/{id}/adicionar` cria uma cópia privada de treino público de outro usuário. Copia exercícios de catálogo ativo, sem registros nem metas de recorde. Ainda falta cliente frontend para essa chamada.

**Diferença de domínio:** `workout-enrollments.ts` registra inscrição por e-mail e ID de ficha. O backend não possui esse vínculo; copiar um treino não permite calcular inscritos por ficha de origem.

- [x] Adicionar operação de cópia em `treinos-api.ts`, usar a listagem real de treinos públicos e substituir templates fixos quando forem equivalentes a esses treinos.
- [x] Apresentar a ação existente como “Adicionar aos meus treinos”; atualizar a listagem usando o ID da cópia. Tratar 409 ao tentar copiar treino próprio e impedir duplo envio na interface.
- [x] Decidir se a experiência de inscrição permanece como requisito. Se permanecer, criar entidade/migration de inscrição com usuário, ficha de origem, estado e datas; definir unicidade e cancelamento sem perda de histórico.
- [x] Para inscrições, definir **propostas** `GET/POST /api/inscricoes` e `DELETE /api/inscricoes/{id}`, autorização do titular e resposta que permita identificar a ficha. Só então substituir `enrollInWorkoutPlan`, `leaveWorkoutPlan` e consultas locais.
- [x] Definir campos das fichas como descrição/frequência, hoje presentes em `WORKOUT_PLANS` e ausentes no DTO de treino. Persisti-los se necessários ou ajustar os cartões.

**Implementação da tarefa 4:** `POST /api/treinos/{id}/adicionar` é chamado em “Adicionar aos meus treinos”, só no cartão de treino de outra pessoa. A cópia entra na lista pelo id retornado. 409 mantém a lista e o botão não dispara duas gravações. Os templates locais não são o mesmo que um treino público: têm inscrição, descrição e frequência, que o DTO não possui. Eles continuam só no navegador, com esse limite escrito na página principal, e não foram trocados pela cópia. Inscrição não entra nesta entrega; o contrato proposto fica para a entrega 7, e `enrollInWorkoutPlan` não foi substituído. Descrição e frequência não foram persistidas.

**Aceite:** cópia é independente do original e não carrega recordes/histórico; se houver inscrição, inscrever/cancelar persiste entre dispositivos e não altera inscrições de outra conta. Contagem de inscritos não é inferida de cópias sem relação de origem. A parte de inscrição deste aceite continua na entrega 7.

## 11. Execução de exercícios, conclusão e histórico pessoal

**Existente:** `POST /api/registros` e `GET /api/registros?pagina=0&tamanho=50`, vinculados ao usuário autenticado. A listagem retorna array, com tamanho limitado a 100, sem envelope com total.

**Contrato de criação:** `catalogoId`, `tempoS` e métricas por modalidade; opcionais `treinoId`, `exercicioId`, `cargaKg`, `repeticoes`, `series`, `distanciaM`, `executadoEm`, `chaveIdempotencia`, observadas as validações do serviço. `catalogoId` aqui corresponde ao item chamado `catalogoExercicioId` na associação da ficha.

- [x] Adicionar DTOs de registros em `contracts.ts` e criar `registros-api.ts`.
- [x] Criar formulário de execução com unidades explícitas: segundos, metros e quilogramas. Aplicar regras de musculação/aeróbico do `RegistroDiarioService`; não tentar extrair números de `meta`, que é texto livre.
- [x] Gerar chave de idempotência por execução e reutilizá-la ao repetir a mesma submissão. Usar IDs reais e somente vincular a treinos do usuário.
- [x] Carregar histórico paginado, oferecendo “Carregar mais” ou equivalente. Não interpretar apenas a primeira página como histórico completo.
- [x] Resolver o botão “Concluir treino”: o histórico local guarda uma conclusão de ficha, enquanto a API guarda uma execução de exercício. Proposta para preservar a experiência: criar sessão de treino com ID próprio, estado, início/conclusão e relação com registros, além de endpoint de conclusão idempotente e transacional. Contrato e migration ainda precisam ser definidos.
- [x] Até existir sessão, exibir registros como execuções de exercícios. Não contabilizar cada exercício como um treino concluído nem agrupar por dia como se isso identificasse uma sessão.
- [x] Substituir `workout-history.ts` como fonte de dados e recalcular indicadores de `pagina-principal.tsx` a partir da API. Para sequência de dias, definir fuso de negócio (proposta: `America/Sao_Paulo`) e testar virada de dia. Para totais, consultar todas as páginas necessárias ou criar agregação no backend.

**Implementação da tarefa 5:** `registros-api.ts` cria com `POST /api/registros` e lista com `GET /api/registros`. A tela de realizar treino pede minutos e envia `tempoS` em segundos; carga fica em kg e distância em m. A meta continua texto e não é interpretada como número. Cada exercício pendente ganha uma chave e a reutiliza se aquela gravação falhar. Não foi criada sessão de treino, porque o contrato e a migration continuam em aberto. O botão que gravava “treino concluído” no navegador saiu da página principal. O histórico lista execuções, mostra o nome do exercício e o nome do treino gravados no registro, e oferece “Carregar mais” enquanto a página voltar cheia. Os totais percorrem todas as páginas de 100. Semana e sequência usam `America/Sao_Paulo`. A sequência conta dias com execução e não trata o dia como sessão. Inscrições locais permanecem. `workout-history.ts` continua só nos relatórios administrativos, que são a entrega 7.

**Aceite:** registro persiste e repetição com a mesma chave não duplica; cada modalidade valida suas métricas; histórico mostra apenas a conta atual; arquivamento do treino preserva nomes históricos; totais e sequência não dependem do navegador ou de uma página incompleta.

## 12. Convites e promoção de administradores

**Tela:** `pages-admin/pagina-superusuario.tsx`; substituir `adicionarAdmin` local.

**Contratos existentes:** `POST /api/admin/convites` com `{ convidadorId, email }`, restrito a `SUPERUSUARIO`, retorna `{ id, email, token, expiraEm }`; `POST /api/admin/convites/aceite` com `{ usuarioId, token }`, autenticado, retorna 204.

- [ ] Corrigir o backend para derivar convidador/beneficiário do principal, ou validar igualdade com os IDs enviados. Atualmente o serviço usa os IDs do corpo sem vinculá-los à identidade autenticada.
- [ ] Criar `admin-api.ts` e DTOs de convite; trocar cadastro local de e-mail por emissão de convite, exibindo validade e link/token de forma controlada. A API atual devolve token; não pressupor envio de e-mail implementado.
- [ ] Criar tela de aceite com preservação do convite durante login/cadastro, sem permitir promoção direta pelo navegador.
- [ ] Após aceite, renovar a sessão para refletir o novo perfil. Tratar convite expirado, já usado, e-mail incompatível e convite pendente duplicado.
- [ ] Se for necessária lista de administradores/convites, definir endpoints novos; os POSTs existentes não fornecem essa listagem.

**Aceite:** apenas superusuário emite convites; usuário autenticado aceita somente para a própria conta elegível; adulterar IDs não muda convidador/beneficiário; perfil atualizado sobrevive à recarga.

## 13. Manutenção administrativa do catálogo

**Existente:** `POST /api/admin/catalogo-exercicios`, `PUT/DELETE /api/admin/catalogo-exercicios/{id}`, restritos a `ADMINISTRADOR` e `SUPERUSUARIO`. Corpo de criação/edição: `{ nome, modalidade, grupoMuscular }`; DELETE desativa o item.

- [ ] Criar seção administrativa de catálogo, usando o cliente já existente e guarda de perfil.
- [ ] Integrar criação, edição e confirmação de desativação; invalidar consultas do catálogo após sucesso.
- [ ] Definir se será necessário visualizar itens inativos; a consulta de catálogo disponível não deve ser presumida uma listagem administrativa completa.
- [ ] Preservar associações/histórico existentes e impedir seleção de item inativo em novas inclusões.

**Aceite:** alterações aparecem nos seletores reais; usuário comum recebe 403 ao tentar escrever; desativação não apaga registros históricos.

## 14. Gestão administrativa de alunos e fichas

**Telas:** `pages-admin/pagina-dashboard-admin.tsx`, `pagina-treinos-admin.tsx`. Usuários vivem em estado React; fichas e contagens vêm de dados locais; “Gerenciar Ficha” está desabilitado.

- [ ] Definir **propostas** `GET/POST /api/admin/usuarios` e `PATCH /api/admin/usuarios/{id}/status`, com busca, paginação, filtros e permissões explícitas. Não usar cadastro público para simular provisionamento administrativo sem definir ativação/credenciais.
- [ ] Definir contrato para nome, e-mail, status e data de cadastro; decidir se a ação de excluir será desativação ou outro fluxo, preservando histórico.
- [ ] Garantir que desativação bloqueie acesso/renovação de sessão conforme a política implementada e que administradores não possam escalar privilégios por esse fluxo.
- [ ] Definir gestão de fichas oficiais: propriedade, quem pode editar e campos necessários. O CRUD pessoal de treinos não concede administração global sobre treinos de alunos.
- [ ] Integrar contagens de inscritos somente após implementar o vínculo descrito na seção 10; habilitar “Gerenciar Ficha” apenas quando houver fluxo completo.

**Aceite:** busca, criação e mudança de status persistem; ações indevidas são bloqueadas no servidor; dados e contagens são consistentes em navegadores diferentes.

## 15. Relatórios e métricas administrativas

**Tela:** `pages-admin/pagina-relatorios-admin.tsx`, além dos cartões do dashboard. Não existem endpoints agregados administrativos identificados.

- [ ] Definir **propostas** `GET /api/admin/relatorios/resumo` e `GET /api/admin/relatorios/alunos`, restritos aos perfis administrativos, com período, paginação e filtros.
- [ ] Especificar fórmulas antes de implementar: alunos identificados, inscrições ativas, sessões concluídas, última sessão e alunos ativos nos últimos 30 dias; decidir se atividade usa sessão concluída ou execução registrada e ajustar os rótulos.
- [ ] Agregar no backend por ID estável de usuário, com datas e fuso acordados. Não buscar registros de todas as contas pelo endpoint pessoal nem atribuir identidade por e-mail armazenado no navegador.
- [ ] Remover cálculos globais baseados em `getWorkoutHistory`/`getWorkoutEnrollments` e eventos de `localStorage`.
- [ ] Exibir carregamento, ausência de dados e falha de consulta separadamente; permitir repetição e manter filtros.

**Aceite:** totais batem com conjunto conhecido no banco, incluindo limites de período e múltiplas execuções na mesma sessão; usuário comum não consulta relatórios; resultados não dependem de dados locais.

## 16. Validação e encerramento da integração

- [ ] Atualizar testes de controllers/services afetados e adicionar cenários de autorização entre duas contas, sobretudo em exercícios e convites.
- [ ] Manter os testes de frontend já existentes (`npm run test:ui` em `frontend/MotivaFit`) e ampliá-los para convite, catálogo administrativo e relatórios quando essas telas existirem. O script de testes já existe; a validação integrada no navegador com backend real continua pendente.
- [ ] Executar testes do backend (`./mvnw test`, em `backend/MotivaFIt`, com as dependências de ambiente necessárias), build (`npm run build`) e lint (`npm run lint`) do frontend.
- [ ] Validar no navegador com backend e banco reais: cadastro → login → catálogo → ficha com exercícios → execução → histórico → recarga → logout; executar também os fluxos administrativos com cada perfil.
- [ ] Cobrir cookies/CSRF, sessão expirada, indisponibilidade, duplo envio, falha parcial, listas vazias e acesso por outra conta. Testar persistência em outro navegador/dispositivo.
- [ ] Retirar listas fixas e persistência local de domínio das funcionalidades integradas. Preferências visuais, como tema, podem permanecer locais. Não importar silenciosamente histórico/identidades fictícias; se houver migração, definir mapeamento, consentimento e deduplicação separados.
- [ ] Atualizar a documentação antiga e exemplos de ambiente, sem incluir credenciais. Registrar funcionalidades adiadas e impedir que seus botões aparentem sucesso local.

**Concluído quando:** cada funcionalidade do escopo aprovado usa dados persistidos da API, possui autorização no servidor, estados de falha visíveis e critérios de aceite verificados. Este plano foi produzido por inspeção estática; não foram executados testes nem comprovada a operação conjunta dos serviços nesta etapa.

## 17. O que ainda falta integrar

Conferido em 06/11/2026. As entregas 1 a 5 estão nas telas do aluno: cadastro, login, sessão, catálogo para montar treino, CRUD de treino, ficha, cópia de treino público, execução e histórico pessoal em `/principal`. A meta da ficha é numérica na tela e continua gravada no texto `meta` que a API já aceita.

O backend não está completo para todas as telas administrativas e para os requisitos posteriores ao MVP. Só dá para ligar uma tela nova onde o controller já existe. Onde não há endpoint, a tela continua local e não deve aparentar que gravou no servidor.

### Telas ainda não feitas, com API já existente

- Catálogo administrativo. O backend expõe `POST`, `PUT` e `DELETE /api/admin/catalogo-exercicios`, e o cliente já tem `criarExercicioCatalogo`, `atualizarExercicioCatalogo` e `desativarExercicioCatalogo`. Não há rota nem tela. O menu **Treinos** (`/admin/treinos`) não é essa manutenção: ele lista as três fichas fixas de `workout-plans.ts`.
- Convite de administrador. `POST /api/admin/convites` existe e é restrito a `SUPERUSUARIO`. A rota `/admin/superusuario` só avisa que a emissão estará disponível em breve. Falta o formulário de e-mail, a exibição controlada do token e da validade, e o tratamento de convite duplicado. O corpo ainda manda `convidadorId`; a entrega 6 continua exigindo que o servidor use a identidade autenticada.
- Aceite do convite. `POST /api/admin/convites/aceite` existe. Não há rota de aceite, nem preservação do token durante login ou cadastro, nem renovação da sessão depois da promoção.

### Telas que existem, mas ainda não falam com o backend

- `/admin` (`pagina-dashboard-admin.tsx`) cria, busca e apaga alunos só no estado da página. Os cartões usam `getWorkoutHistory` e `getWorkoutEnrollments`. Não há `GET` ou `PATCH /api/admin/usuarios`.
- `/admin/treinos` conta inscrições dessas fichas no `localStorage`. **Gerenciar Ficha** não tem fluxo. Não há API de inscrição nem de ficha oficial.
- `/admin/relatorios` calcula frequência, ranking e exercícios a partir do histórico local. Não há `GET /api/admin/relatorios/resumo` nem `GET /api/admin/relatorios/alunos`.
- `/principal` ainda oferece inscrição nas três fichas fixas. Isso não é requisito da Visão e não tem API. A cópia de treino público já está em `/treinos`.

### Requisitos até a Sprint 7 sem tela e sem endpoint

- RF-12, Should: gráficos de evolução de carga, frequência e pace ao longo do tempo. `/principal` só mostra execuções na semana e a sequência de dias. Os registros já vêm de `GET /api/registros`; não existe endpoint de série temporal.
- RF-14 a RF-17, painel administrativo: usuários ativos em 30 dias, frequência média, ranking dos dez por tempo e os três exercícios mais feitos. As telas atuais não consultam o banco.
- RF-18 e RF-19, Should: criar e remover desafio entre amigos. Não há rota, página nem controller.

### Fora desse conjunto, também sem contrato

- Recuperação de senha: o login aponta o recurso como pendente. Não há endpoint.
- Login com Google (RF-24, Could, Sprint 9): a liberação em `SecurityConfig` não é uma implementação.
- Sessão de treino concluído: não há entidade nem endpoint. O histórico lista execuções de exercício, como a entrega 5 decidiu.
- Recorde calculado (RF-20, Sprint 8) e conquistas (RF-22, Sprint 9) não entram na integração até a Sprint 7.

### O que retirar quando as telas acima forem reais

`workout-plans.ts`, `workout-enrollments.ts` e `workout-history.ts` deixam de ser fonte de domínio. Tema pode continuar no navegador. Botões dessas telas não devem confirmar uma gravação que só existiu na página.
