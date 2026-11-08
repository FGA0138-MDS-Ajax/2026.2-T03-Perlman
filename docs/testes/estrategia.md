# 6 Testes de software

A estratégia de qualidade foca em garantir uma experiência fluida e livre de falhas lógicas. A abordagem engloba testes unitários rigorosos (especialmente para a lógica de pontuação e serviços do back-end), testes funcionais de integração da API (Application Programming Interface, interface de programação de aplicações) e avaliações de desempenho. O objetivo é assegurar não apenas o funcionamento correto, mas também garantir que as interfaces respondam rapidamente.

## 6.1 Estratégia de testes

**Níveis de testes abordados**

- **Unitário:** testes isolados de funções e componentes.
- **Integração:** testes da comunicação entre módulos, com foco na interação das rotas da API com a base de dados (PostgreSQL) e na integração das telas do front-end com os endpoints do back-end.
- **Sistema:** testes que simulam o fluxo completo do usuário, desde a interação na interface móvel até a resposta do servidor e a persistência dos dados.

**Tipos de testes abordados:** o foco principal reside nos testes funcionais: validação das regras de negócio (criação de treinos, evolução de cargas), fluxos de autenticação com e-mail e senha no MVP e, nas Sprints finais, login opcional com o Google e operações de CRUD (Create, Read, Update, Delete: criar, consultar, atualizar e excluir) no sistema. Adicionalmente, são planejados testes não funcionais focados na usabilidade da interface móvel e na sua adaptação a diferentes telas.

**Ambientes de testes usados**

O processo de testes obedece à política de branches e commits estabelecida para o projeto no GitHub:

- **Ambiente local:** ambiente utilizado pela equipe de desenvolvimento para a criação e execução dos testes na respectiva branch da funcionalidade antes de solicitar a integração.
- **Ambiente de Integração Contínua (CI):** ao abrir um Pull Request para a branch principal, os fluxos do GitHub Actions são acionados automaticamente, executando os testes unitários e de integração em containers Docker. O merge só é autorizado se toda a pipeline de testes for aprovada sem falhas.

**Formas de análise dos testes propostos**

Os testes são avaliados por meio dos relatórios de execução local e dos logs de execução do GitHub Actions. Em caso de falha, o Analista de Qualidade (Bernardo) examina o erro em conjunto com os desenvolvedores responsáveis pela funcionalidade, garantindo o reparo e acompanhando a correção por meio de inspeções de código até a nova aprovação dos testes.

**Resultados obtidos**

Até esta revisão, os casos estão planejados e não há resultados de execução ou evidências registrados neste documento. O registro de execução da seção 6.2 apresenta essa situação explicitamente, com zero ciclos executados. Cada caso de teste possui um resultado esperado (previsto), detalhado no roteiro de testes (seção 6.2). Qualquer divergência frente ao comportamento real (realizado) da aplicação é identificada como um defeito. Esse defeito deve ser reparado e o ciclo de teste repetido até que o resultado realizado corresponda ao previsto (**Previsto = Realizado**), atingindo o critério de aprovação do caso executado. Casos apenas planejados não constituem evidência de ausência de defeitos.
