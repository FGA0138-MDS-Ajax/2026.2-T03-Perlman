# MotivaFit — Front-end

Aplicação web do MotivaFit, em **React 19**, **TypeScript**, **Vite**, **Tailwind CSS** e **shadcn/ui**.

A aplicação consome a API do back-end em `http://localhost:8080`. Suba o back-end antes, conforme o [README do back-end](../../backend/MotivaFIt/README.md).

## Como executar com Docker

### Desenvolvimento

O contêiner usa Node.js 22 e recarrega a página a cada alteração no código.

```bash
docker compose -f docker-compose.dev.yml up
```

- **Endereço:** <http://localhost:3000>
- **Parar:** `Ctrl + C`, ou `docker compose -f docker-compose.dev.yml down`

### Produção

A aplicação é compilada e servida pelo Nginx, com compressão Gzip e suporte às rotas da SPA.

```bash
docker compose up -d --build
```

- **Endereço:** <http://localhost:4173>
- **Parar:** `docker compose down`

## Como executar sem Docker

Requer Node.js 22 ou superior.

```bash
npm install
npm run dev
```

A aplicação fica em <http://localhost:3000>.

## Comunicação com a API

As chamadas usam o caminho `/api` na mesma origem do front-end. Em desenvolvimento, o Vite encaminha `/api` para o back-end; em produção, o Nginx faz esse papel.

| Variável | Onde vale | Para que serve |
| :-- | :-- | :-- |
| `API_PROXY_TARGET` | Servidor do Vite | Endereço do back-end. Padrão: `http://localhost:8080` |
| `VITE_API_BASE_URL` | Build | Endereço público da API. Vazio usa `/api` na mesma origem |
| `VITE_GOOGLE_CLIENT_ID` | Build | Client ID OAuth do Google, o mesmo de `GOOGLE_CLIENT_ID` no back-end. Vazio oculta o botão "Entrar com Google" |

O arquivo `.env.example` traz as três variáveis. O back-end aceita por padrão a origem `http://localhost:3000`; se o front-end rodar em outro endereço, ajuste `CORS_ALLOWED_ORIGIN` no back-end.

## Scripts

| Comando | O que faz |
| :-- | :-- |
| `npm run dev` | Servidor de desenvolvimento na porta 3000 |
| `npm run build` | Verifica os tipos e gera a versão de produção |
| `npm run preview` | Serve localmente a versão de produção |
| `npm run lint` | Análise estática com o oxlint |
| `npm test` | Testes do cliente HTTP e da interface |
| `npm run test:ui` | Somente os testes de interface (Vitest) |

## Rotas

| Rota | Acesso | Descrição |
| :-- | :-- | :-- |
| `/` | Público | Página inicial |
| `/login` | Público | Autenticação |
| `/cadastro` | Público | Criação de conta |
| `/termos-de-uso` | Público | Termos de uso |
| `/principal` | Usuário logado | Página principal do usuário |
| `/treinos` | Usuário logado | Gerenciamento de treinos |
| `/realizar-treino` | Usuário logado | Página de treinos no modo de realização |
| `/treinos/:treinoId/realizar` | Usuário logado | Realização de um treino |
| `/historico` | Usuário logado | Histórico |
| `/desafios` | Usuário logado | Desafios com metas, convites, participação e progresso |
| `/amigos` | Usuário logado | Solicitações e lista de amigos |
| `/grupos` | Usuário logado | Grupos, membros, convites e feed |
| `/conta` | Usuário logado | Conta do usuário |
| `/admin` | Administrador | Dashboard administrativo |
| `/admin/treinos` | Administrador | Totais de treinos e treinos públicos mais adicionados |
| `/admin/catalogo` | Administrador | Catálogo de exercícios |
| `/admin/relatorios` | Administrador | Métricas gerais de uso e exportação em CSV |
| `/admin/metricas` | Administrador | Métricas por período (ativos, frequência, tempo, retenção) |
| `/admin/superusuario` | Superusuário | Página do superusuário |

## Estrutura do código

| Pasta | Conteúdo |
| :-- | :-- |
| `src/pages-user` | Telas do usuário |
| `src/pages-admin` | Telas administrativas |
| `src/components` | Componentes compartilhados e de interface (`ui`) |
| `src/lib/api` | Cliente HTTP e chamadas à API |
| `src/lib` | Sessão do usuário e utilitários |
| `tests` | Testes automatizados |
