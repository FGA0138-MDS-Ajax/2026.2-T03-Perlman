# Preparação para integração com o backend

O frontend continua operando no modo local atual. Os módulos em `src/lib/api/` são clientes tipados prontos para uso futuro; nenhuma tela chama esses módulos automaticamente e nenhum acesso ao PostgreSQL é feito pelo navegador.

## Configuração local

1. Copie `.env.example` para `.env.local` e ajuste `VITE_API_BASE_URL` para a URL do backend.
2. O Vite usa a porta `3000`, que corresponde à origem padrão `CORS_ALLOWED_ORIGIN` configurada no backend.
3. Configure `CORS_ALLOWED_ORIGIN` no backend com a origem exata do frontend. O backend define cookies de refresh/CSRF com `Secure`; login, renovação e logout com cookies requerem HTTPS no ambiente compartilhado ou uma configuração de desenvolvimento acordada entre os responsáveis pelo backend.
4. Os tokens de acesso são mantidos apenas em memória pelo cliente HTTP. O backend entrega o refresh token em cookie `HttpOnly` e exige o cookie `csrfToken` no cabeçalho `X-CSRF-TOKEN` para `/api/auth/refresh` e `/api/auth/logout`.

## Contratos disponíveis

Os DTOs em `src/lib/api/contracts.ts` espelham os DTOs do backend. Chamadas implementadas:

| Operação | Endpoint |
| --- | --- |
| Cadastrar conta | `POST /api/auth/cadastro` |
| Login | `POST /api/auth/login` |
| Renovar sessão | `POST /api/auth/refresh` |
| Encerrar sessão | `POST /api/auth/logout` |
| Listar, buscar, criar, atualizar e excluir treinos do usuário autenticado | `/api/treinos` |
| Listar e buscar catálogo de exercícios | `/api/catalogo-exercicios` |
| Criar, atualizar e desativar exercício do catálogo (admin) | `/api/admin/catalogo-exercicios` |

O backend protege `/api/treinos` com JWT e restringe a manutenção do catálogo aos perfis `ADMINISTRADOR` e `SUPERUSUARIO`. A visibilidade de treino aceita `PRIVADO` ou `PUBLICO`.

`readJwtUsuarioClaims` apenas decodifica o payload para leitura da interface; não valida a assinatura do token. A autorização real deve ser sempre aplicada pelo backend em cada requisição protegida.

## Contratos que precisam ser combinados/implementados no backend

Não foram criadas chamadas fictícias para funcionalidades sem endpoint correspondente. Antes de conectar as telas abaixo, frontend e backend precisam definir DTOs, rotas, autorização, persistência e respostas para:

- Perfil atual/dados editáveis do usuário. O backend atual retorna `id`, `email`, `perfil` e `ativo`, sem nome; o cadastro atual também recebe somente e-mail e senha.
- Cadastro/listagem de administradores. O backend já possui os perfis `ADMINISTRADOR` e `SUPERUSUARIO`, mas não há endpoints para conceder/listar perfis; a lista local de e-mails do protótipo não deve ser usada como autorização de produção.
- Inscrição e cancelamento de inscrição em fichas. Não há relação de inscrição na API ou nas migrations atuais.
- Conclusão/histórico de sessões. A tabela/API de treino descreve fichas, mas não registra sessões concluídas ou datas de conclusão.
- Relatórios agregados e acesso administrativo a usuários. Os endpoints atuais não oferecem listagem de usuários nem métricas globais.
- Exercícios associados a uma ficha. Existem DTOs e entidade `Exercicio`, mas ainda não há controller/rotas para consultar ou persistir esses itens.

Não conecte o frontend diretamente ao banco. As telas devem consumir a API autenticada; decisões de autorização e validação devem permanecer no backend.
