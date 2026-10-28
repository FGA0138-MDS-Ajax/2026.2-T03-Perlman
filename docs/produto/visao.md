# Documento de Visão do Produto e do Projeto — MotivaFit

**Universidade de Brasília · Grupo Perlman — T03****Versão 1.0.0 · Brasília, 2026**

> Documento de visão do produto e do projeto MotivaFit, elaborado pelo Grupo Perlman — T03, na disciplina de Métodos de Desenvolvimento de Software (MDS), Universidade de Brasília.

## Integrantes da equipe

**Tabela 1 – Integrantes do grupo**

| Matrícula | Nome                               | Função       |           Pontos |
| :--------- | :--------------------------------- | :------------- | ---------------: |
| 232024966  | Bernardo Campos Caxito Silveira    | GQM            |            14,28 |
| 251039442  | Bruno Cruvinel Barros da Silva     | Documentação |            14,29 |
| 252004290  | Lucas Venâncio Pereira            | Back-end       |            14,28 |
| 252023741  | Luís Felipe Pontes Vieira Andrade | Back-end       |            14,28 |
| 251026248  | Mateus Fernandes Dantas\*          | Front-end      |            14,29 |
| 251013651  | Matheus Estevam Ferreira           | Back-end       |            14,29 |
| 211062428  | Rafael Souto Lopes Laube           | Front-end      |            14,29 |
|            | **Total**                    |                | **100,00** |

*Fonte: elaborado pelos autores (2026).*
\* Líder da equipe. GQM: Goal-Question-Metric (objetivo–questão–métrica). Os pontos devem fechar 100 para toda a equipe.

## Histórico de revisões

**Tabela 2 – Histórico de revisões**

| Data       | Versão | Descrição                                | Autor          |
| :--------- | :------ | :----------------------------------------- | :------------- |
| 22/09/2026 | 0.1.0   | Elaboração inicial do documento          | Equipe Perlman |
| 30/09/2026 | 1.0.0   | Revisão conforme apontamentos da síntese | Equipe Perlman |

*Fonte: elaborado pelos autores (2026).*

---

## 1 Visão geral do produto

O MotivaFit é um aplicativo web voltado para praticantes de exercícios físicos que buscam organização e constância. A solução simplifica a montagem de treinos e utiliza a gamificação, com sistemas de conquistas e recompensas, para engajar o usuário, dando visibilidade à sua evolução e combatendo a desmotivação.

### 1.1 Problema

- **Contexto:** muitas pessoas desejam praticar exercícios físicos de forma regular, mas enfrentam grandes dificuldades na organização de suas rotinas (como estruturar corretamente a divisão de grupos musculares), no acompanhamento de seu progresso e na manutenção da consistência a longo prazo.
- **Problema encontrado:** a falta de planejamento claro e a ausência de percepção de evolução rápida geram desmotivação e levam ao abandono das atividades.

### 1.2 Declaração de posição do produto

O MotivaFit é um aplicativo web de saúde e fitness. A declaração a seguir segue o modelo de posicionamento de Moore [1]. O produto propõe reunir organização de treinos, registro de exercícios, acompanhamento da evolução e conquistas por assiduidade.

A análise de concorrência considera aplicativos de registro de treinos: o Hevy oferece acompanhamento do progresso [9]; o Strong oferece registro de treinos [10]; o JEFIT oferece registro de exercícios e sessões de treino [11]. Esses aplicativos atendem necessidades próximas às do MotivaFit. A combinação de organização, motivação e interação social é a proposta do projeto, sem pressupor exclusividade dessas funcionalidades no mercado.

O web app é voltado tanto para quem está iniciando sua rotina de treinos quanto para quem já está familiarizado com os exercícios, mas gostaria de acompanhar métricas e comparar seu desempenho com seus amigos (semelhante a aplicativos como Strava e GymRats).

**Tabela 3 – Declaração de posição do produto**

| Campo                       | Declaração                                                                                                                                                                                                                                             |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Para**              | Praticantes de exercícios físicos, frequentadores de academia e iniciantes.                                                                                                                                                                            |
| **Necessidade**       | Organizar treinos, acompanhar a evolução de cargas e manter a constância diária.                                                                                                                                                                     |
| **O nome do produto** | MotivaFit é um aplicativo web de saúde e fitness.                                                                                                                                                                                                      |
| **Que**               | Gamifica a rotina de exercícios e organiza as divisões de treino, oferecendo um acompanhamento prático, recompensas por assiduidade e métricas claras de evolução, além da liberdade para montar seus próprios treinos com foco no seu objetivo. |
| **Ao contrário**     | Planilhas, blocos de notas e aplicativos de registro de treinos, como Hevy, Strong e JEFIT [9–11].                                                                                                                                                      |
| **Nosso produto**     | Foca na retenção e motivação do usuário por meio de um sistema de conquistas (gamificação) aliado a uma interface intuitiva e simplificada para a gestão dos treinos diários e do progresso.                                                    |

*Fonte: elaborado pelos autores (2026).*

### 1.3 Objetivos do produto

#### 1.3.1 Objetivo principal

Apoiar e motivar os usuários na manutenção da regularidade das atividades físicas por meio de gamificação, recompensas visuais, organização simplificada e liberdade para montar os seus treinos, focando em aumentar a percepção de evolução e auxiliar no controle dos treinos executados.

#### 1.3.2 Objetivos secundários

- Facilitar a criação de rotinas de treinos com foco em hipertrofia, permitindo a correta divisão muscular (por exemplo, isolar o treino de quadríceps e grupos sinergistas).
- Fornecer gráficos e estatísticas de frequência e evolução de cargas ao longo do tempo.

#### 1.3.3 Objetivos da gamificação

Buscando atender todos os usuários do modelo Hexad de gamificação [2, 3], serão implementadas funcionalidades justificando a cadeia **motivação → mecânica → requisito**:

- **ACHIEVER (motivado por Mastery)**
  - *Elemento:* foco absoluto em progressão (PR – Personal Record). O aplicativo fornece gráficos detalhados de evolução para cada elemento do treino do usuário, recompensando a maestria na execução técnica e a superação contínua de limites.
  - *Rastreabilidade:* RF-12 e RF-20; testes planejados T9 e T19.
- **PHILANTHROPIST (motivado por Purpose)**
  - *Elemento:* sistema de compartilhamento comunitário. Usuários podem compartilhar seus resultados em um espaço público para apoiar a motivação dos demais, conforme RF-21.
  - *Rastreabilidade:* RF-21; sem teste planejado no MVP (Minimum Viable Product, produto mínimo viável).
- **FREE SPIRIT (motivado por Autonomy)**
  - *Elemento:* personalização da rotina. O usuário pode criar e alterar seus treinos e selecionar exercícios predefinidos para compor a rotina e ajustar suas metas. A autonomia é atendida pelas operações existentes de gerenciamento de treinos e exercícios; não há um modo separado de Treino Livre ou um requisito de catálogo exploratório no escopo.
  - *Rastreabilidade:* RF-03, RF-05, RF-07 e RF-09; testes planejados T4, T6, T15 e T17.
- **PLAYER (motivado por Reward)**
  - *Elemento:* programa de recompensas diretas. A assiduidade nos treinos libera conquistas visuais no perfil, conforme os critérios definidos para RF-22.
  - *Rastreabilidade:* RF-22; teste planejado T10.
- **SOCIALISER (motivado por Relatedness)**
  - *Elemento:* feed de atividades interativo. O aplicativo permite a criação de pequenos grupos de treino onde os membros podem curtir, comentar e celebrar os resultados diários uns dos outros, fortalecendo as relações.
  - *Rastreabilidade:* RF-23; sem teste planejado no MVP.
- **DISRUPTOR (motivado por Change)**
  - *Elemento:* submissão de desafios. Espaço para que esses usuários criem desafios fora do padrão (como "Desafio de 100 repetições") para testar os limites de cada um, além de ter um grupo próprio para as pessoas colocarem seus resultados desses desafios.
  - *Rastreabilidade:* RF-18; sem teste planejado no MVP.

### 1.4 Tecnologias a serem utilizadas

**Tabela 4 – Tecnologias utilizadas**

| Tecnologia              | Requisito / Motivação                                                       | Alternativa considerada | Custo aceito                                                                                            |
| :---------------------- | :---------------------------------------------------------------------------- | :---------------------- | :------------------------------------------------------------------------------------------------------ |
| Java / Spring Boot      | Robustez para regras de negócio (back-end).                                  | Node.js / Express       | Maior verbosidade em troca de tipagem forte.                                                            |
| React                   | Criação de interface web interativa (front-end).                            | Vue.js                  | Curva de aprendizado da equipe em troca de ecossistema.                                                 |
| PostgreSQL              | Estruturação relacional de treinos e usuários.                             | MongoDB                 | Rigidez do schema em troca de integridade ACID (atomicidade, consistência, isolamento e durabilidade). |
| Docker / GitHub Actions | Automação da esteira de CI/CD (integração contínua e entrega contínua). | Implantação manual    | Tempo de configuração em troca de confiabilidade.                                                     |
| Git / GitHub            | Versionamento colaborativo.                                                   | GitLab                  | Padrão de mercado adotado pela equipe.                                                                 |

*Fonte: elaborado pelos autores (2026).*

- **Ambiente e infraestrutura:** suporte contínuo a ambientes operacionais baseados em Linux e implantação via containers Docker.
- **Gerenciamento do projeto:** reuniões realizadas pelo Discord/Teams e grupo no WhatsApp.

---

## 2 Visão geral do projeto

O desenvolvimento do projeto é conduzido sob uma abordagem ágil e iterativa, unindo a estrutura de gestão do Scrum (focada em Sprints curtas e entregas contínuas de valor) às práticas de engenharia do eXtreme Programming (XP) [4, 5]. O trabalho é sustentado por Pair Programming, revisões de código e uma esteira automatizada de Integração Contínua (CI) para garantir entregas seguras e alinhadas às necessidades do usuário.

### 2.1 Ciclo de vida do projeto

O projeto adotará metodologias ágeis baseadas no framework Scrum, com iterações (Sprints) de uma semana. Essa abordagem visa entregas incrementais focadas em valor, permitindo a validação contínua de funcionalidades motivacionais com os usuários.

A Figura 1 apresenta a sequência adotada: o Product Backlog reúne as necessidades do produto; na Sprint Planning, a equipe seleciona os itens e define o Sprint Backlog. A execução ocorre em uma Sprint de uma semana. Ao final, a Review avalia a entrega com os interessados e a Retrospectiva identifica melhorias no processo. O incremento representa a funcionalidade concluída que amplia o produto. Embora a imagem apresente uma sequência linear, o processo é repetido a cada Sprint, com atualização do backlog e incorporação das melhorias identificadas [5].

![Figura 1 – Ciclo de vida do projeto: Pair Programming, Commit, Code Review (PR), Merge e Deploy](../assets/img/visao-fig1-ciclo-de-vida.png)

*Figura 1 – Ciclo de vida do projeto. Fonte: elaborado pelos autores (2026), com base no Guia do Scrum [5].*

**Tabela 5 – Aspectos do processo**

| Aspecto       | Definição                                                                                                                              |
| :------------ | :--------------------------------------------------------------------------------------------------------------------------------------- |
| Metodologia   | Desenvolvimento Ágil.                                                                                                                   |
| Processo      | Scrum.                                                                                                                                   |
| Procedimentos | Sprint Planning, Code Review, Pair Programming, Integração Contínua, Refinamento do Backlog e Sprint Reviews.                         |
| Métodos      | UML (Unified Modeling Language, linguagem de modelagem unificada), User Stories, Planning Poker, MoSCoW, Análise de Pontos de Função. |
| Ferramentas   | Git, GitHub, Figma, VS Code, IntelliJ, Docker, Postman, Maven.                                                                           |

*Fonte: elaborado pelos autores (2026).*

### 2.2 Organização do projeto

**Tabela 6 – Papéis e responsabilidades**

| Papel                  | Atribuições                                                                                                           | Responsável                   |
| :--------------------- | :---------------------------------------------------------------------------------------------------------------------- | :----------------------------- |
| Desenvolvedor Backend  | Codificar o produto, codificar testes unitários, realizar refatoração. Estruturar a lógica de funcionamento do app. | Matheus Estevam, Luís, Lucas  |
| Desenvolvedor Frontend | Codificar o produto, codificar testes unitários, realizar refatoração. Desenvolver a interface de usuário do app.   | Rafael Laube, Mateus Fernandes |
| Documentação         | Confecção dos documentos para entrega.                                                                                | Bruno                          |
| Dono do Produto        | Atualizar o escopo do produto, organizar o escopo das sprints, validar as entregas.                                     | Monitor Daniel                 |
| Analista de Qualidade  | Garantir a qualidade do produto, garantir o cumprimento do conceito de pronto, realizar inspeções de código.         | Bernardo                       |
| Cliente                | Validar negócio e expectativas.                                                                                        | Ricardo Ajax                   |

*Fonte: elaborado pelos autores (2026).*

#### 2.2.1 Análise causal

O diagrama de Ishikawa organiza possíveis causas de um problema em categorias, relacionando-as ao efeito analisado [12]. Na Figura 2, o efeito é o abandono de atividades físicas e a desmotivação. Os ramos apresentam falta de planejamento, ausência de engajamento e falta de percepção de evolução, com suas causas específicas e os requisitos propostos para enfrentá-las:

- **Falta de planejamento:** desorganização de rotinas e divisões musculares inadequadas. Origina a necessidade de cadastro de treino (RF-03).
- **Ausência de engajamento:** treinos monótonos, tédio e falta de incentivo social. Origina as conquistas (RF-22) e a submissão de desafios (RF-18).
- **Falta de percepção de evolução:** dificuldade em perceber resultados rápidos. Origina o acompanhamento de métricas (RF-12).

![Figura 2 – Diagrama de Ishikawa: efeito ](../assets/img/visao-fig2-ishikawa.png)

*Figura 2 – Diagrama de Ishikawa. Fonte: elaborado pelos autores (2026), utilizando a técnica de causa e efeito descrita pela ASQ [12].*

### 2.3 Planejamento das fases (Sprints)

**Abreviações da tabela:** Resp.: responsáveis; % acum.: percentual acumulado.

O percentual acumulado representa a cobertura funcional planejada, ponderada pelas estimativas preliminares do backlog, e não o progresso real de execução. RF-01 a RF-23 somam 47 unidades estimadas. As Sprints 3 a 9 acrescentam, respectivamente, 7, 6, 8, 6, 7, 7 e 6 unidades: o acumulado arredondado é 15%, 28%, 45%, 57%, 72%, 87% e 100%. As Sprints 1 e 2 são preparatórias; a Sprint 10 estabiliza as entregas. RF-24 permanece fora do cálculo até receber uma estimativa. O progresso realizado deverá considerar somente funcionalidades concluídas, testadas e aceitas; as estimativas ainda não constituem uma contagem formal de PF.

**Tabela 7 – Planejamento das sprints**

| Sprint | Produto (entrega)                                                                                                                                                                            | Período                | Entregáveis                                                                   | Resp. | % acum. |
| :----: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------- | :----------------------------------------------------------------------------- | :---: | :-----: |
|   1   | Definição do Produto, Documento de Visão, definição do MVP e Planejamento do Projeto.                                                                                                   | 22/09/2026 a 27/09/2026 | Documento de visão.                                                           | Todos |   0%   |
|   2   | Documento de Arquitetura, base estrutural de projeto e testes.                                                                                                                               | 28/09/2026 a 04/10/2026 | Documento de Arquitetura, estrutura base e testes, slides das apresentações. | Todos |   0%   |
|   3   | Cadastro de usuário e autenticação com e-mail e senha e treinos (cadastro, listagem, alteração e exclusão de treino).                                                                  | 05/10/2026 a 11/10/2026 | Backend, Banco de Dados e interfaces base.                                     | Todos |   15%   |
|   4   | Manter exercícios (cadastrar, listar, alterar, excluir e marcar exercício como realizado). Conclusão e validação do MVP com cadastro e login por e-mail e senha, treinos e exercícios. | 12/10/2026 a 18/10/2026 | Testes unitários aprovados e documentação.                                  | Todos |   28%   |
|   5   | Acompanhamento de métricas do usuário, convite de usuário administrador com e-mail. Painel administrativo: visualizar usuários ativos nos últimos 30 dias.                              | 19/10/2026 a 25/10/2026 | Testes unitários aprovados e documentação.                                  | Todos |   45%   |
|   6   | Painel administrativo: frequência média de treinos, ranking de treinos.                                                                                                                    | 26/10/2026 a 01/11/2026 | Testes unitários aprovados e documentação.                                  | Todos |   57%   |
|   7   | Painel administrativo: exibir os três exercícios mais realizados pelos usuários. Painel do usuário: submissão de desafios, remoção de desafios.                                       | 02/11/2026 a 08/11/2026 | Testes unitários aprovados e documentação.                                  | Todos |   72%   |
|   8   | Criação do botão de recorde pessoal, sistema de compartilhamento comunitário.                                                                                                            | 09/11/2026 a 15/11/2026 | Testes unitários aprovados e documentação.                                  | Todos |   87%   |
|   9   | Inspeções, streak diário, feed de atividades interativo. Integração opcional do login com o Google (RF-24, Could have), conforme a capacidade da equipe.                                | 16/11/2026 a 22/11/2026 | Testes unitários aprovados e documentação.                                  | Todos |  100%  |
|   10   | Estabilização e entrega: testes, correções de bugs e entrega do produto final. Validação do login com o Google (RF-24, Could have), caso implementado.                                 | 23/11/2026 a 29/11/2026 | Entrega do produto final, documentação final e testes totais.                | Todos |  100%  |

*Fonte: elaborado pelos autores (2026).*

### 2.4 Matriz de comunicação

**Tabela 8 – Matriz de comunicação**

| Descrição                                                             | Envolvidos                         | Periodicidade | Produtos gerados                                            |
| :---------------------------------------------------------------------- | :--------------------------------- | :------------ | :---------------------------------------------------------- |
| Acompanhamento das atividades em andamento                              | Toda a equipe do projeto           | Semanal       | Ata de reunião, relatório de situação do projeto.       |
| Acompanhamento dos riscos, compromissos, ações pendentes, indicadores | Toda a equipe do projeto           | Semanal       | Relatórios focados na resolução de pendências e riscos. |
| Comunicar situação do projeto                                         | Toda a equipe, Professor e Monitor | Diária       | Alinhamentos quanto ao progresso do projeto.                |

*Fonte: elaborado pelos autores (2026).*

### 2.5 Gerenciamento de riscos

**Tabela 9 – Riscos**

| Risco                                                                | Fase do projeto                    |  Grau  | Mitigação (prevenção)                                                                                                                                                                           | Contingência (reação)                                                                                                                                                                                                       |
| :------------------------------------------------------------------- | :--------------------------------- | :----: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Atraso nas entregas devido ao ciclo curto de 1 semana                | Todas as Sprints                   |  Alto  | Realizar reuniões de Sprint Planning rigorosas.                                                                                                                                                    | Não negociar o aumento da duração da Sprint. As tarefas não concluídas devem ser interrompidas, retornar para o backlog e ser replanejadas para entrega na Sprint imediatamente seguinte.                                 |
| Abandono/saída de membro da equipe                                  | Todas as Sprints                   | Baixo | Fomentar a prática de Pair Programming para evitar que apenas uma pessoa saiba mexer numa parte do código e manter a documentação sempre atualizada.                                            | Redistribuir imediatamente as tarefas críticas pelos restantes membros da equipe e reportar ao P.O. (Monitor Daniel) para reduzir a carga de trabalho (story points) planejada para as Sprints seguintes.                     |
| Falha na integração com serviços externos (autenticação Google) | Sprints 9 e 10 (RF-24, Could have) | Médio | Iniciar os testes de requisição isoladamente via Postman antes de integrar o código ao front-end e ao back-end.                                                                                  | Manter o cadastro e login com e-mail e senha já disponíveis no MVP (CF-01 e CF-02). Replanejar a integração opcional com o Google (CF-09) sem bloquear as funcionalidades obrigatórias ou comprometer a entrega final.    |
| Desalinhamento com as expectativas do cliente                        | Sprints de ponto de controle       | Baixo | Envolver o cliente nas Sprint Reviews, reforçando a cada reunião o cronograma de entregas e deixando claro que o software é entregue em incrementos e ainda se encontra em fase de construção. | Agendar uma reunião extraordinária de alinhamento para relembrar os prazos estritos das Sprints, esclarecendo que qualquer nova exigência não negociada irá para o Backlog para não comprometer o prazo da Sprint atual. |

*Fonte: elaborado pelos autores (2026).*

### 2.6 Critérios de replanejamento

Os critérios de replanejamento definem os cenários críticos que inviabilizam o cronograma atual. Para o projeto MotivaFit, utilizando a metodologia Scrum, qualquer replanejamento causará o versionamento deste documento. Os critérios adotados são:

- **Abandono da equipe** por parte de algum membro, exigindo a readequação dos pontos de esforço da Sprint.
- **Alterações de escopo:** se o cliente ou o Dono do Produto solicitarem mudanças estruturais nos cenários funcionais que ultrapassem a capacidade de entrega semanal da equipe.
- **Atraso crítico em requisitos MUST:** caso a equipe atrase e não consiga entregar funcionalidades obrigatórias.
- **Acumulação de dívida técnica (débito técnico):** quando a métrica de débito técnico (falta de refatoração, código não documentado ou ausência de testes) atingir um nível crítico que torne a base de código insustentável, impedindo a equipe de desenvolver e integrar novas funcionalidades com segurança.

---

## 3 Processo de desenvolvimento de software

O fluxo de trabalho unifica a estrutura de gestão do Scrum com práticas de engenharia do eXtreme Programming (XP) [4, 5]. O gerenciamento estrutura entregas em Sprints iterativas curtas. O desenvolvimento é guiado por Testes Contínuos e Pair Programming. A esteira técnica utiliza Code Review constante entre a equipe e Integração Contínua (CI) via GitHub Actions, com aplicação contínua de princípios SOLID (responsabilidade única, aberto/fechado, substituição de Liskov, segregação de interfaces e inversão de dependência) e Clean Code no desenvolvimento em Java/Spring Boot.

A equipe não adotará a Daily Scrum, pois a disponibilidade dos integrantes impossibilita a realização de encontros diários. Essa decisão representa uma adaptação do processo em relação ao Scrum descrito em [5]. O acompanhamento das atividades e a comunicação de impedimentos ocorrerão pelos canais de comunicação do grupo e nas reuniões semanais de acompanhamento.

A Figura 3 mostra o fluxo de trabalho no nível de gestão das entregas. Os requisitos partem do Product Backlog e são selecionados durante a Sprint Planning, formando o Sprint Backlog. Durante a Sprint de uma semana, a equipe implementa os itens selecionados, aplica os testes e realiza as revisões de código e a integração contínua descritas nesta seção. Essas práticas técnicas ocorrem dentro da etapa Sprint, embora não estejam detalhadas na imagem.

A etapa Review & Retro reúne a avaliação da entrega e a reflexão sobre o processo. A Review verifica o resultado com os interessados; a Retrospectiva orienta ajustes para o próximo ciclo. O incremento corresponde à parte concluída do produto. Os itens pendentes ou as novas necessidades retornam ao planejamento das próximas Sprints [5].

![Figura 3 – Fluxo de trabalho: Product Backlog, Sprint Planning, Sprint Backlog, Sprint (1 semana), Review & Retro, Incremento](../assets/img/visao-fig3-fluxo-de-trabalho.png)

*Figura 3 – Fluxo de trabalho do projeto. Fonte: elaborado pelos autores (2026), com base no Guia do Scrum [5].*

---

## 4 Declaração de escopo do projeto

O escopo central do projeto abrange a criação de uma plataforma interativa onde o "Atleta Amador" pode criar fichas de treino personalizadas, registrar a conclusão diária de exercícios (check-ins) e acompanhar seu progresso estatístico. Estão inclusas no escopo as lógicas de gamificação (Hexad) para recompensar a assiduidade do usuário, além de um painel administrativo para gestão global do sistema.

### 4.1 Backlog do produto

A elicitação dos requisitos e a construção deste backlog foram realizadas majoritariamente por meio de brainstorming entre os membros da equipe e análise do problema, com base nas dificuldades reais de praticantes de exercícios físicos em manter a constância.

#### 4.1.1 Classificação de prioridade (MoSCoW)

MoSCoW reúne as categorias Must have (obrigatório), Should have (importante), Could have (desejável) e Won't have (fora da entrega atual).

A priorização dos itens foi definida da seguinte forma (visão da equipe, a ser validada pelo Dono do Produto, P.O.):

- **MUST (obrigatório):** requisitos essenciais ao produto. O MVP da Sprint 4 reúne RF-01 a RF-11; RF-12 também é obrigatório para o produto, mas sua entrega está prevista para a Sprint 5, após o MVP.
- **SHOULD (importante):** requisitos de alto valor agregado (como funcionalidades de gamificação e gráficos). São fundamentais para a retenção e proposta de valor do aplicativo, mas não impedem o fluxo básico de uso se entregues em um segundo momento.
- **COULD (desejável):** funcionalidades que ampliam a experiência de uso, como a integração de login com o Google, mas que possuem menor prioridade e não são necessárias para a entrega do MVP. Sua implementação depende da capacidade disponível nas Sprints finais.

### 4.2 Perfis

Haverá dois perfis de acesso, o usuário e o administrador. O usuário poderá acessar todas as funcionalidades referentes ao uso do aplicativo, ficando livre para testar as funcionalidades, enquanto o perfil administrador acompanhará as métricas e informações do aplicativo, como número de usuários, funcionalidades mais usadas e tempo médio de usuário no app, dentre outros.

**Tabela 10 – Perfis de acesso**

| Perfil        | Características                                                                                                                                                                                                        | Permissões                         |
| :------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------- |
| Administrador | Acompanham as métricas de uso do aplicativo: quantos usuários acessaram nos últimos 30 dias, qual a frequência média de treino, quem está no topo das atividades e quais atividades estão sendo mais utilizadas. | Painel Admin (métricas).           |
| Usuário      | Atletas ou iniciantes em atividades físicas. Buscam registrar seus desempenhos individuais e comparar com seus amigos.                                                                                                 | Uso do app e métricas individuais. |

*Fonte: elaborado pelos autores (2026).*

### 4.3 Cenários

**Tabela 11 – Cenários funcionais**

| ID    | Cenário                                                                                                                                                       | Sprints |
| :---- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: |
| CF-01 | Novo usuário cria sua conta com e-mail e senha                                                                                                                |    3    |
| CF-02 | Usuário cadastrado deseja autenticar-se com e-mail e senha                                                                                                    |    3    |
| CF-03 | Usuário deseja cadastrar, listar, alterar ou excluir seus treinos                                                                                             |    3    |
| CF-04 | Usuário deseja cadastrar, listar, alterar e excluir exercícios de um treino e registrar sua execução                                                       |    4    |
| CF-05 | Usuário já possui acesso ao sistema e deseja acompanhar sua evolução nos treinos                                                                           |  5, 8  |
| CF-06 | Usuário já possui acesso ao sistema, já possui registros de exercícios, busca novos desafios e deseja comparar sua evolução com a de seu grupo de amigos | 7, 8, 9 |
| CF-07 | Administrador não possui acesso, mas pode receber um e-mail de convite para realizar seu cadastro                                                             |    5    |
| CF-08 | Administrador já tem acesso ao sistema e deseja acessar o painel de acompanhamento de métricas                                                               | 5, 6, 7 |
| CF-09 | Usuário deseja autenticar-se pelo Google como alternativa ao acesso com e-mail e senha, após a entrega do MVP                                                |  9, 10  |

*Fonte: elaborado pelos autores (2026).*

### 4.4 Tabela de backlog do produto

**Abreviações da tabela:** Est.: estimativa preliminar de planejamento do requisito, sem equivalência direta em horas ou contagem formal de PF; US: User Story (história de usuário); ID: identificador. O símbolo "–" indica estimativa ainda não definida.

O backlog identifica cada requisito funcional pelo código RF e o cenário de uso correspondente pelo código CF. Um cenário pode reunir vários requisitos: por exemplo, CF-03 corresponde ao gerenciamento de treinos e está associado a cadastro (RF-03), listagem (RF-04), alteração (RF-05) e exclusão (RF-06). Essa identificação permite relacionar cada funcionalidade ao planejamento e aos testes.

Pontos de função (PF) são uma unidade de medida do tamanho funcional do software, considerando as funcionalidades oferecidas ao usuário, independentemente da linguagem ou tecnologia utilizada [8]. A contagem considera funções de dados e transações, como entradas, saídas e consultas, classificadas conforme sua complexidade. PF não representa diretamente horas de trabalho nem pontos de esforço da Sprint.

O MVP será concluído ao final da Sprint 4 e compreenderá o cadastro e o login com e-mail e senha, o gerenciamento de treinos e o gerenciamento e registro de exercícios. O acesso inicial está dividido em cadastro de usuário com e-mail e senha (RF-01, cenário CF-01) e autenticação com e-mail e senha (RF-02, cenário CF-02), ambos obrigatórios (Must have). O backlog atribui o valor inicial de 1 a cada requisito, totalizando 2 unidades estimadas para cadastro e autenticação. Esses valores são estimativas preliminares de planejamento; a contagem formal em PF depende do detalhamento das funções, dos dados envolvidos e da aplicação das regras de contagem [8]. O desenvolvimento dessas funcionalidades está distribuído entre as Sprints 3 e 4, com a conclusão e validação do conjunto de login, treinos e exercícios na Sprint 4, conforme os casos de teste previstos.

A integração de login com o Google corresponde ao requisito RF-24, associado ao cenário CF-09, com prioridade Could have. Está prevista para as Sprints finais: implementação na Sprint 9 e validação na Sprint 10, conforme a capacidade da equipe. O acesso com e-mail e senha permanece disponível independentemente dessa integração. A estimativa funcional de RF-24 será definida no refinamento do requisito.

**Tabela 12 – Backlog detalhado**

| Requisito                                       | Cenário | Sprint | Prioridade | Est. | Descrição sucinta                                                      | User story associada                                                                                                 |
| :---------------------------------------------- | :------: | :----: | :--------: | :--: | :----------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| **RF-01** Cadastro com e-mail e senha     |  CF-01  |   3   |    Must    |  1  | Criar conta com e-mail e senha.                                          | US-01: Como visitante, quero criar minha conta com e-mail e senha para acessar o aplicativo.                         |
| **RF-02** Login com e-mail e senha        |  CF-02  |   3   |    Must    |  1  | Autenticar com e-mail e senha e rejeitar credenciais inválidas.         | US-02: Como usuário cadastrado, quero entrar com e-mail e senha para acessar meus treinos.                          |
| **RF-03** Cadastro de treino              |  CF-03  |   3   |    Must    |  1  | Cadastrar treino com nome e tipo.                                        | US-03: Como usuário, quero cadastrar meu treino para organizar minha rotina.                                        |
| **RF-04** Listagem de treinos             |  CF-03  |   3   |    Must    |  2  | Listar os treinos do usuário e permitir adicionar treinos já montados. | US-04: Como usuário, quero visualizar meus treinos e adicionar treinos já montados para organizar minhas opções. |
| **RF-05** Alteração de treino           |  CF-03  |   3   |    Must    |  1  | Alterar nome e tipo de treino.                                           | US-05: Como usuário, quero alterar meu treino para adaptar minha rotina.                                            |
| **RF-06** Exclusão de treino             |  CF-03  |   3   |    Must    |  1  | Excluir treino do usuário.                                              | US-06: Como usuário, quero excluir um treino para remover rotinas que não utilizo.                                 |
| **RF-07** Cadastrar exercício no treino  |  CF-04  |   4   |    Must    |  1  | Adicionar exercício predefinido a um treino e definir metas.            | US-07: Como usuário, quero adicionar exercícios e metas ao treino para planejar a sessão.                         |
| **RF-08** Listar exercícios              |  CF-04  |   4   |    Must    |  2  | Listar exercícios e metas de um treino.                                 | US-08: Como usuário, quero consultar exercícios e metas para executar meu treino.                                  |
| **RF-09** Alterar exercício              |  CF-04  |   4   |    Must    |  1  | Editar informações de exercício vinculado a treino.                   | US-09: Como usuário, quero ajustar as metas do exercício para adaptar meu treino.                                  |
| **RF-10** Excluir exercício              |  CF-04  |   4   |    Must    |  1  | Excluir exercício de um treino.                                         | US-10: Como usuário, quero remover um exercício para atualizar minha rotina.                                       |
| **RF-11** Registrar exercício realizado  |  CF-04  |   4   |    Must    |  1  | Registrar execução, carga, repetições, séries e tempo.              | US-11: Como usuário, quero registrar a execução dos exercícios para manter meu histórico.                       |
| **RF-12** Métricas de evolução         |  CF-05  |   5   |    Must    |  2  | Exibir indicadores de desempenho e evolução.                           | US-12: Como usuário, quero acompanhar minhas métricas para perceber minha evolução.                              |
| **RF-13** Convite admin por e-mail        |  CF-07  |   5   |   Could   |  3  | Enviar convite por e-mail para novo administrador.                       | US-13: Como superusuário, quero convidar administradores para delegar a gestão do sistema.                         |
| **RF-14** Usuários ativos (Admin)        |  CF-08  |   5   |   Should   |  3  | Exibir quantidade de usuários ativos nos últimos 30 dias.              | US-14: Como administrador, quero consultar usuários ativos para acompanhar a adesão.                               |
| **RF-15** Frequência média (Admin)      |  CF-08  |   6   |   Should   |  3  | Exibir frequência média de treinos por semana e usuário.              | US-15: Como administrador, quero consultar a frequência média para acompanhar a constância.                       |
| **RF-16** Ranking usuários (Admin)       |  CF-08  |   6   |   Should   |  3  | Exibir os dez usuários com maior tempo de treino nos últimos 30 dias.  | US-16: Como administrador, quero consultar o ranking para acompanhar a atividade dos usuários.                      |
| **RF-17** Exercícios mais feitos (Admin) |  CF-08  |   7   |   Should   |  3  | Exibir os três exercícios mais realizados nos últimos 30 dias.        | US-17: Como administrador, quero consultar exercícios mais realizados para conhecer o uso.                          |
| **RF-18** Submissão de desafios          |  CF-06  |   7   |    Must    |  3  | Criar desafios entre amigos com exercícios, metas e prazo.              | US-18: Como usuário, quero propor desafios para incentivar meu grupo de amigos.                                     |
| **RF-19** Remoção de desafios           |  CF-06  |   7   |    Must    |  1  | Remover desafio criado pelo usuário.                                    | US-19: Como usuário, quero remover meus desafios para manter as propostas atualizadas.                              |
| **RF-20** PR – Recorde pessoal           |  CF-05  |   8   |    Must    |  2  | Acompanhar metas de recordes pessoais no exercício.                     | US-20: Como usuário, quero acompanhar meus recordes pessoais para perceber minha evolução.                        |
| **RF-21** Partilha de resultados          |  CF-06  |   8   |   Should   |  5  | Compartilhar resultados em espaço comunitário público.                | US-21: Como usuário, quero compartilhar meus resultados para motivar a comunidade.                                  |
| **RF-22** Conquistas (streak)             |  CF-06  |   9   |    Must    |  2  | Exibir conquistas de assiduidade no perfil.                              | US-22: Como usuário, quero visualizar minhas conquistas para reconhecer minha constância.                          |
| **RF-23** Feed interativo                 |  CF-06  |   9   |   Should   |  4  | Permitir grupos por convite e interação com resultados diários.       | US-23: Como usuário, quero curtir e comentar resultados do meu grupo para incentivar meus amigos.                   |
| **RF-24** Login com Google                |  CF-09  | 9, 10 |   Could   |  –  | Oferecer autenticação opcional com Google após o MVP.                 | US-24: Como usuário, quero entrar com Google como alternativa para facilitar meu acesso.                            |

*Fonte: elaborado pelos autores (2026). Todos os requisitos são do tipo funcional.*

#### 4.4.1 Descrição dos requisitos

Todos os requisitos abaixo são do tipo funcional. Os identificadores RF correspondem aos cenários CF apresentados na tabela de backlog.

- **RF-01** — Permitir ao usuário não autenticado criar sua conta no sistema informando e-mail e senha. Requisito obrigatório para o MVP, associado ao cenário CF-01.
- **RF-02** — Permitir ao usuário cadastrado acessar o sistema com e-mail e senha válidos e impedir o acesso com credenciais inválidas. Requisito obrigatório para o MVP, associado ao cenário CF-02.
- **RF-03** — O usuário adiciona o seu novo treino, definindo o nome e tipo de treino (musculação ou aeróbico).
- **RF-04** — O usuário irá visualizar o catálogo de treinos dele, permitindo também adicionar treinos já montados (basta o usuário adicionar na sua lista).
- **RF-05** — Permite ao usuário fazer alteração no treino (nome e tipo de treino: musculação ou aeróbico).
- **RF-06** — Permite ao usuário remover um treino da sua lista de treinos.
- **RF-07** — Permite ao usuário cadastrar um novo exercício dentro de um treino, definindo a meta de tempo, repetições e/ou carga deste exercício, além do pace para corrida. Essas metas ficam em um campo de texto, onde o usuário digita a meta. Esse exercício já está predefinido na tabela de exercícios, de forma que o usuário não consegue criar o seu exercício.
- **RF-08** — Listar os exercícios de um treino (exibir o nome do exercício e suas metas).
- **RF-09** — Permite ao usuário a edição e atualização das informações de um exercício já cadastrado em um treino.
- **RF-10** — Permite ao usuário remover um exercício da sua lista de exercícios de um treino.
- **RF-11** — Permite ao usuário registrar a execução de um exercício em seu treino, registrando meta de carga, de repetições, de séries e tempo de execução.
- **RF-12** — O usuário pode visualizar indicadores de desempenho e evolução física ao longo do tempo.
- **RF-13** — Permite ao superusuário enviar um convite de novo administrador pelo e-mail do novo administrador.
- **RF-14** — Exibe a quantidade de usuários ativos nos últimos 30 dias.
- **RF-15** — Exibe a frequência média de treinos/semana/usuário.
- **RF-16** — No painel do administrador, exibe o ranking dos usuários ativos nos últimos 30 dias, listados por maior tempo de treino (top 10).
- **RF-17** — No painel do administrador, exibe os 3 exercícios mais realizados pelos usuários nos últimos 30 dias.
- **RF-18** — No painel do usuário, criar uma lista de exercícios entre amigos para realizarem dentro de um prazo de tempo. Definindo, para cada exercício, metas de carga, repetições, séries ou tempo de exercício.
- **RF-19** — Permite ao usuário remover um desafio criado.
- **RF-20** — Opção para a criação de um acompanhamento sobre a evolução do usuário em suas metas de recordes pessoais (campo de texto no exercício).
- **RF-21** — Local público para compartilhar os resultados dos usuários para fazer com que eles continuem se motivando.
- **RF-22** — Conquistas visuais no perfil de cada usuário para que eles possam mostrar o seu empenho nos seus treinos.
- **RF-23** — Criação de pequenos grupos de treino onde os membros podem curtir, comentar e celebrar os resultados diários uns dos outros, fortalecendo as relações (entrada por meio de convite).
- **RF-24** — Integrar a autenticação com o Google como alternativa ao login com e-mail e senha. Requisito Could have, associado ao cenário CF-09, previsto para implementação e validação nas Sprints 9 e 10 conforme a capacidade da equipe, após a entrega do MVP. A integração não substitui o acesso com e-mail e senha.

### 4.5 Matriz de rastreabilidade

**Tabela 13 – Matriz de rastreabilidade**

| Problema / cenário        | Perfil         | Requisitos    | Testes planejados                                                  | Métrica               |
| :------------------------- | :------------- | :------------ | :----------------------------------------------------------------- | :--------------------- |
| Acesso (CF-01, CF-02)      | Usuário       | RF-01, RF-02  | T1, T2, T3, T22                                                    | M2                     |
| Organização (CF-03)      | Usuário       | RF-03 a RF-06 | T4 a T7, T14                                                       | Uso / Throughput       |
| Personalização (CF-04)   | Free Spirit    | RF-07 a RF-10 | T15 a T18                                                          | M3                     |
| Registro (CF-04)           | Usuário       | RF-11         | T8                                                                 | Uso / M3               |
| Evolução (CF-05)         | Achiever       | RF-12, RF-20  | T9, T19                                                            | Uso / Throughput       |
| Convite (CF-07)            | Superusuário  | RF-13         | A detalhar antes da Sprint 5                                       | M2                     |
| Gestão (CF-08)            | Administrador  | RF-14 a RF-17 | T11 (acesso); testes funcionais a detalhar antes das Sprints 5 a 7 | Throughput             |
| Desafios (CF-06)           | Disruptor      | RF-18, RF-19  | A detalhar antes da Sprint 7                                       | Uso                    |
| Compartilhamento (CF-06)   | Philanthropist | RF-21         | A detalhar antes da Sprint 8                                       | Uso                    |
| Conquistas (CF-06)         | Player         | RF-22         | T10                                                                | Uso                    |
| Interação (CF-06)        | Socialiser     | RF-23         | A detalhar antes da Sprint 9                                       | Uso                    |
| Acesso alternativo (CF-09) | Usuário       | RF-24         | T12, T13, T21, T22                                                 | M2                     |
| Usabilidade do MVP         | Usuário       | RF-01 a RF-11 | T20                                                                | Conclusão das tarefas |

*Fonte: elaborado pelos autores (2026).*

---

## 5 Métricas e medições

Para assegurar a saúde e a transparência do projeto, aplicamos a abordagem GQM (Goal-Question-Metric, objetivo–questão–métrica) estruturada para garantir rastreabilidade entre as metas de negócio e as métricas operacionais coletadas [6].

### 5.1 O quadro GQM estruturado e questões

Os códigos G, Q e M identificam, respectivamente, objetivos (Goals), questões (Questions) e métricas (Metrics).

A tabela utiliza o padrão explícito do framework GQM (*Analisar / com o propósito de / com respeito a / do ponto de vista de / no contexto de*) e o relaciona diretamente às respectivas questões e métricas.

**Tabela 14 – Quadro GQM de acompanhamento do projeto**

| ID | Objetivo estruturado (Goal)                                                                                                                                                                                                   | Questão (Question)                                                        | Métrica (Metric)                  |
| :-: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- | :--------------------------------- |
| G1 | Analisar o processo de desenvolvimento com o propósito de avaliar a cadência de entrega com respeito a produtividade da equipe do ponto de vista de gerenciamento de projeto no contexto das Sprints semanais do MotivaFit. | Q1: Qual a cadência de entrega da equipe por Sprint?                      | M1: Throughput (vazão) de issues. |
| G2 | Analisar o produto gerado com o propósito de avaliar a estabilidade do software com respeito a ocorrência de falhas do ponto de vista de qualidade no contexto das entregas contínuas do MotivaFit.                        | Q2: Qual a estabilidade do software entregue na Sprint?                    | M2: Densidade de defeitos.         |
| G3 | Analisar o código-fonte com o propósito de garantir a blindagem contra regressões com respeito a testes automatizados do ponto de vista de engenharia de software no contexto da integração contínua do MotivaFit.      | Q3: O código em produção está adequadamente coberto por testes?        | M3: Percentual de cobertura.       |
| G4 | Analisar a base de código com o propósito de controlar a manutenibilidade com respeito a débito técnico do ponto de vista de desenvolvimento no contexto do repositório do projeto.                                      | Q4: Qual o nível de dívida técnica acumulada no código da aplicação? | M4: Dívida técnica.              |

*Fonte: elaborado pelos autores (2026).*

### 5.2 Fichas de detalhamento das métricas (5W1H, escalas e análises)

5W1H reúne seis perguntas: What (o quê), Why (por quê), Who (quem), Where (onde), When (quando) e How (como).

#### Métrica 1 (M1): throughput (vazão) de issues por Sprint

| Campo                 | Detalhamento                                                                                                                                                                                       |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Definição           | Quantidade de histórias (issues) concluídas (Done) ao final de cada iteração.                                                                                                                  |
| What (o quê)         | Número de issues encerradas por Sprint.                                                                                                                                                           |
| Why (por quê)        | Identificar a cadência de entrega para evitar sobrecarga ou ociosidade no time.                                                                                                                   |
| Who (quem)            | Analista de Qualidade e Desenvolvedores.                                                                                                                                                           |
| Where (onde)          | Board do GitHub Projects (aba "Done").                                                                                                                                                             |
| When (quando)         | Ao final de cada Sprint (durante a Review).                                                                                                                                                        |
| Cálculo / How (como) | Somatório simples absoluto das tarefas movidas para a coluna de finalizadas no período.                                                                                                          |
| Escala de unidade     | issues / sprint (número inteiro).                                                                                                                                                                 |
| Valor esperado        | 4 a 6 tarefas por Sprint. Justificativa: baseado na capacidade atual de horas da equipe (estimada via Planning Poker para as aproximadamente 14 horas disponíveis semanais por membro).           |
| Forma de análise     | Gráfico de tendência (controle de vazão / burn-up) analisado durante a Retrospectiva. Se o valor ficar abaixo da meta por duas Sprints, o escopo do backlog deve ser renegociado com o cliente. |

*Fonte: elaborado pelos autores (2026).*

#### Métrica 2 (M2): densidade de defeitos

| Campo                 | Detalhamento                                                                                                                                                                                                     |
| :-------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Definição           | Relação matemática entre os defeitos válidos registrados e o volume de entregas (issues fechadas).                                                                                                           |
| What (o quê)         | Falhas de código ou de regras de negócio identificadas.                                                                                                                                                        |
| Why (por quê)        | Avaliar se a velocidade de entrega não está gerando instabilidade na aplicação.                                                                                                                              |
| Who (quem)            | Analista de Qualidade (registro) e Equipe (resolução).                                                                                                                                                         |
| Where (onde)          | Issues do repositório no GitHub (filtradas pela label `bug`).                                                                                                                                                 |
| When (quando)         | Fechamento de cada Sprint e eventos de Release.                                                                                                                                                                  |
| Cálculo / How (como) | D = (nº de bugs registrados na Sprint) / (nº de issues concluídas na Sprint).                                                                                                                                 |
| Escala de unidade     | bugs / issue (número decimal).                                                                                                                                                                                  |
| Valor esperado        | ≤ 0,2 bugs/issue.                                                                                                                                                                                               |
| Forma de análise     | Comparação direta com o teto de 0,2. Se o indicador ultrapassar esse limite, a Sprint subsequente deve travar o desenvolvimento de novas features e focar obrigatoriamente na resolução de bugs (hardening). |

*Fonte: elaborado pelos autores (2026).*

#### Métrica 3 (M3): percentual de cobertura de testes (coverage)

| Campo                 | Detalhamento                                                                                                                                                              |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Definição           | Proporção de linhas úteis de código validadas e testadas pelos scripts automatizados na esteira de integração.                                                      |
| What (o quê)         | Métrica de Line Coverage da aplicação global.                                                                                                                          |
| Why (por quê)        | Garantir que refatorações não quebrem as lógicas de gamificação e treinos existentes.                                                                               |
| Who (quem)            | Desenvolvedores responsáveis pelos testes e QA (Quality Assurance, garantia da qualidade) responsável pela auditoria.                                                   |
| Where (onde)          | Logs do GitHub Actions e painel de validação de PR.                                                                                                                     |
| When (quando)         | A cada abertura e atualização de Pull Request (PR) para as branches principais.                                                                                         |
| Cálculo / How (como) | C = [(linhas cobertas back-end + linhas cobertas front-end) / (total de linhas back-end + total de linhas front-end)] × 100.                                             |
| Escala de unidade     | Porcentagem (%).                                                                                                                                                          |
| Valor esperado        | ≥ 70%. Justificativa: limiar de convenção interna para balancear estabilidade e agilidade na prototipagem inicial.                                                     |
| Forma de análise     | Ação automatizada bloqueante no CI. Pull Requests que reduzam o percentual global para baixo da meta de 70% não poderão ser mesclados (merged) sob nenhuma hipótese. |

*Fonte: elaborado pelos autores (2026).*

#### Métrica 4 (M4): dívida técnica (débito técnico)

| Campo                 | Detalhamento                                                                                                                                                                                                                  |
| :-------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Definição           | Medição contínua de violações de boas práticas de desenvolvimento e arquitetura, incluindo bad smells, código duplicado e alto acoplamento [7].                                                                        |
| What (o quê)         | Complexidade ciclomática e code smells.                                                                                                                                                                                      |
| Why (por quê)        | Prevenir o envelhecimento precoce e a insustentabilidade a longo prazo da base de código.                                                                                                                                    |
| Who (quem)            | Todos os membros da equipe de engenharia.                                                                                                                                                                                     |
| Where (onde)          | Dashboard de monitoramento da ferramenta de análise estática (ex.: SonarQube).                                                                                                                                              |
| When (quando)         | Escaneamento diário executado automaticamente pela pipeline.                                                                                                                                                                 |
| Cálculo / How (como) | Varredura da AST (Abstract Syntax Tree, árvore de sintaxe abstrata) da aplicação identificando anti-patterns pré-configurados.                                                                                            |
| Escala de unidade     | Número absoluto de code smells e avaliação em letras (A, B, C, D) para manutenibilidade.                                                                                                                                   |
| Valor esperado        | Zero (0) falhas críticas / classificação "A".                                                                                                                                                                              |
| Forma de análise     | Acompanhamento visual via badge no repositório. O aparecimento de qualquer defeito de nível "Crítico" ou "Blocker" instaura prioridade máxima de refatoração para a dupla de desenvolvimento (Pair Programming) do dia. |

*Fonte: elaborado pelos autores (2026).*

---

## 6 Testes de software

A estratégia de qualidade foca em garantir uma experiência fluida e livre de falhas lógicas. A abordagem engloba testes unitários rigorosos (especialmente para a lógica de pontuação e serviços do back-end), testes funcionais de integração da API (Application Programming Interface, interface de programação de aplicações) e avaliações de desempenho. O objetivo é assegurar não apenas o funcionamento correto, mas também garantir que as interfaces respondam rapidamente.

### 6.1 Estratégia de testes

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

### 6.2 Roteiro de teste

Os códigos T identificam os casos de teste.

O roteiro documenta os cenários de validação planejados (Test Plan). O resultado obtido, a referência da evidência, os reparos e o número de ciclos devem ser atualizados no registro de execução após cada teste. Evidências externas devem ser identificadas por caminho ou URL (Uniform Resource Locator, endereço de um recurso), versão do código e data. Casos apenas planejados não garantem ausência de defeitos, mas estabelecem o critério de sucesso.

O roteiro é organizado em duas tabelas vinculadas pelo ID: planejamento (tipo, nível, pré-condições e resultado previsto) e execução (resultado obtido, evidência, reparos e ciclos). O detalhamento apresenta o objetivo e, nos novos casos, os procedimentos. T2 e T3 validam e-mail e senha do MVP; não testam a senha do Google. O consentimento cancelado é tratado em T13, tokens inválidos ou expirados em T21 e acesso sem sessão em T22.

Os casos T1 a T8, T14 a T18 e T22 devem ser executados nas Sprints 3 e 4; T20 valida o conjunto do MVP na Sprint 4. T9 será executado na Sprint 5, T19 na Sprint 8 e T10 na Sprint 9. T11 acompanha a entrega das funcionalidades administrativas. T12, T13 e T21 dependem da implementação de RF-24 nas Sprints 9 e 10. Os casos funcionais ainda não detalhados de RF-13 a RF-19, RF-21 e RF-23 deverão ser definidos antes da Sprint de implementação de cada requisito, com atualização da matriz. O teste de acesso T11 não substitui os testes funcionais do painel administrativo.

**Tabela 19 – Planejamento dos testes**

| ID / nome                                               | Tipo                         | Nível       | Pré-condições                                                                                                                                                                             | Resultado previsto                                                                                                                                                                         |
| :------------------------------------------------------ | :--------------------------- | :----------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **T1** Cadastro de usuário com e-mail e senha    | Funcional                    | Integração | Usuário ainda não cadastrado; acesso à tela de cadastro; e-mail e senha válidos para o cadastro                                                                                          | A conta e o perfil do usuário são criados. O usuário pode acessar a tela de login para se autenticar com o e-mail e a senha cadastrados                                                 |
| **T2** Login com credencial válida               | Funcional                    | Sistema      | Usuário previamente cadastrado; e-mail e senha válidos                                                                                                                                     | O sistema autentica o usuário e exibe a tela principal correspondente ao perfil                                                                                                           |
| **T3** Login com dados inválidos                 | Funcional / Segurança       | Sistema      | Usuário cadastrado; senha ou e-mail incorreto                                                                                                                                               | O sistema nega o acesso e apresenta uma mensagem clara, sem revelar informação sensível                                                                                                 |
| **T4** Cadastro de treino personalizado           | Funcional                    | Integração | Usuário autenticado; acesso ao formulário de treino; nome e tipo válidos                                                                                                                  | O treino é validado, salvo no banco de dados e exibido na lista de treinos do usuário                                                                                                    |
| **T5** Validação de treino incompleto           | Funcional / Validação      | Integração | Usuário autenticado; acesso à tela de criação de treino                                                                                                                                  | O sistema impede o salvamento e informa quais campos precisam ser preenchidos. Nenhum registro incompleto é criado                                                                        |
| **T6** Alteração de treino existente            | Funcional                    | Integração | Usuário autenticado; existência de um treino salvo                                                                                                                                         | As alterações são salvas e aparecem corretamente na visualização do treino                                                                                                            |
| **T7** Exclusão de treino                        | Funcional                    | Sistema      | Usuário autenticado; existência de treino salvo                                                                                                                                            | O sistema solicita confirmação, exclui o treino após a confirmação e remove o item da listagem. Se o usuário cancelar, o treino permanece salvo                                      |
| **T8** Registro de exercício realizado           | Funcional                    | Integração | Usuário autenticado; existência de treino cadastrado                                                                                                                                       | O exercício é marcado como realizado, o histórico é atualizado e as informações são persistidas pelo banco de dados                                                                 |
| **T9** Atualização de métricas de evolução   | Funcional                    | Sistema      | Usuário autenticado; existência de exercícios realizados com datas e cargas registradas                                                                                                   | Os gráficos e indicadores apresentam os dados correspondentes aos exercícios realizados                                                                                                  |
| **T10** Pontuação e conquista por assiduidade   | Funcional / Gamificação    | Integração | Usuário autenticado; critérios de conquista definidos; registros de assiduidade preparados                                                                                                 | O sistema exibe a conquista no perfil somente quando os critérios de assiduidade são atingidos                                                                                           |
| **T11** Restrição do painel de admin            | Não funcional / Segurança  | Integração | Existência de um usuário comum e um usuário administrador                                                                                                                                 | O usuário comum não consegue acessar o painel administrativo. O administrador consegue acessá-lo normalmente                                                                            |
| **T12** Login com Google                          | Funcional / Autenticação   | Integração | Integração com o Google implementada e configurada; conta Google válida; serviço de autenticação disponível                                                                           | Após autorização e validação da autenticação com o Google, o usuário acessa o sistema com seu perfil. O login com e-mail e senha permanece disponível                             |
| **T13** Falha ou cancelamento no login com Google | Funcional / Segurança       | Integração | Integração com o Google implementada; falha de autenticação, indisponibilidade do serviço ou cancelamento pelo usuário; conta local válida para verificar o acesso com e-mail e senha | O sistema não autentica o usuário pelo Google, informa a falha ou cancelamento e mantém disponível o acesso com e-mail e senha. Credenciais locais válidas permitem acessar o sistema |
| **T14** Listagem de treinos                       | Funcional                    | Sistema      | Usuário autenticado; treinos próprios e de outro usuário cadastrados                                                                                                                      | Exibir os treinos próprios e permitir adicionar um treino já montado; não expor treinos privados de outro usuário                                                                      |
| **T15** Cadastro de exercício no treino          | Funcional                    | Integração | Usuário autenticado; treino próprio cadastrado; exercício predefinido disponível                                                                                                         | Exercício válido vinculado ao treino com a meta informada; dados obrigatórios ausentes impedem o cadastro                                                                               |
| **T16** Listagem de exercícios                   | Funcional                    | Sistema      | Usuário autenticado; treino com exercícios e treino sem exercícios                                                                                                                        | Exibir os nomes e metas corretos de cada treino; apresentar estado vazio quando não houver exercícios                                                                                    |
| **T17** Alteração de exercício                 | Funcional                    | Integração | Usuário autenticado; exercício vinculado a treino próprio                                                                                                                                 | Informações alteradas persistidas e exibidas; demais exercícios mantidos                                                                                                                |
| **T18** Exclusão de exercício                   | Funcional                    | Sistema      | Usuário autenticado; treino próprio com dois exercícios                                                                                                                                   | Exercício removido da lista do treino; outro exercício mantido                                                                                                                           |
| **T19** Recorde pessoal                           | Funcional                    | Sistema      | Usuário autenticado; funcionalidade de PR implementada; exercício com meta de recorde pessoal                                                                                              | Meta e acompanhamento de recorde pessoal persistidos e exibidos corretamente, sem alterar registros de outros exercícios                                                                  |
| **T20** Usabilidade do MVP                        | Não funcional / Usabilidade | Sistema      | MVP disponível; conta de teste; navegador em telas móvel e desktop                                                                                                                         | Fluxos concluídos sem bloqueios de navegação, campos ou botões inacessíveis, texto ilegível ou sobreposição; mensagens orientam a correção de entradas inválidas                |
| **T21** Token Google inválido ou expirado        | Funcional / Segurança       | Integração | RF-24 implementado; resposta de autenticação simulável com token inválido e expirado                                                                                                     | Tokens rejeitados sem criação de sessão; acesso protegido negado; login local permanece disponível                                                                                     |
| **T22** Rota protegida sem sessão                | Funcional / Segurança       | Integração | Aplicação disponível; nenhuma sessão autenticada                                                                                                                                         | Acesso negado sem exposição de dados; interface encaminha ao login e API retorna resposta de não autorização                                                                          |

*Fonte: elaborado pelos autores (2026).*

**Tabela 20 – Registro de execução dos testes**

| ID | Resultado obtido | Evidência       | Reparos          | Ciclos |
| :-: | :--------------- | :--------------- | :--------------- | :----: |
| T1 | Não executado   | Não disponível | Não registrados |   0   |
| T2 | Não executado   | Não disponível | Não registrados |   0   |
| T3 | Não executado   | Não disponível | Não registrados |   0   |
| T4 | Não executado   | Não disponível | Não registrados |   0   |
| T5 | Não executado   | Não disponível | Não registrados |   0   |
| T6 | Não executado   | Não disponível | Não registrados |   0   |
| T7 | Não executado   | Não disponível | Não registrados |   0   |
| T8 | Não executado   | Não disponível | Não registrados |   0   |
| T9 | Não executado   | Não disponível | Não registrados |   0   |
| T10 | Não executado   | Não disponível | Não registrados |   0   |
| T11 | Não executado   | Não disponível | Não registrados |   0   |
| T12 | Não executado   | Não disponível | Não registrados |   0   |
| T13 | Não executado   | Não disponível | Não registrados |   0   |
| T14 | Não executado   | Não disponível | Não registrados |   0   |
| T15 | Não executado   | Não disponível | Não registrados |   0   |
| T16 | Não executado   | Não disponível | Não registrados |   0   |
| T17 | Não executado   | Não disponível | Não registrados |   0   |
| T18 | Não executado   | Não disponível | Não registrados |   0   |
| T19 | Não executado   | Não disponível | Não registrados |   0   |
| T20 | Não executado   | Não disponível | Não registrados |   0   |
| T21 | Não executado   | Não disponível | Não registrados |   0   |
| T22 | Não executado   | Não disponível | Não registrados |   0   |

*Fonte: elaborado pelos autores (2026).*

#### 6.2.1 Detalhamento dos casos de teste

##### T1 – Cadastro de usuário com e-mail e senha

- **Objetivo do teste:** verificar se um novo usuário consegue criar uma conta informando e-mail e senha (RF-01, CF-01).
- **Nível:** integração · **Tipo:** funcional
- **Pré-condições:** usuário ainda não cadastrado; acesso à tela de cadastro; e-mail e senha válidos para o cadastro.
- **Procedimento:** preencher e-mail e senha válidos, enviar o cadastro e verificar a conta criada; repetir com e-mail já cadastrado e dados obrigatórios ausentes.
- **Resultado esperado:** a conta e o perfil do usuário são criados. O usuário pode acessar a tela de login para se autenticar com o e-mail e a senha cadastrados.
- **Resultado da execução e correções:** não executado. Após a execução, registrar se foi aprovado, reprovado ou bloqueado. Se houver falha, informar a correção realizada e o número da execução.

##### T2 – Login com credencial válida

- **Objetivo do teste:** verificar se um usuário cadastrado consegue acessar o sistema com e-mail e senha válidos (RF-02, CF-02).
- **Nível:** sistema · **Tipo:** funcional
- **Pré-condições:** usuário previamente cadastrado; e-mail e senha válidos.
- **Procedimento:** informar e-mail e senha corretos, confirmar o login e acessar a tela principal.
- **Resultado esperado:** o sistema autentica o usuário e exibe a tela principal correspondente ao perfil.
- **Resultado da execução e correções:** não executado. Registrar o resultado real e eventuais correções.

##### T3 – Login com dados inválidos

- **Objetivo do teste:** verificar se o sistema impede o acesso quando o usuário informa e-mail ou senha incorretos (RF-02, CF-02).
- **Nível:** sistema · **Tipo:** funcional / segurança
- **Pré-condições:** usuário cadastrado; senha ou e-mail incorreto.
- **Procedimento:** informar senha incorreta e depois e-mail não cadastrado; tentar acessar uma rota protegida após cada tentativa.
- **Resultado esperado:** o sistema nega o acesso e apresenta uma mensagem clara, sem revelar informação sensível.
- **Resultado da execução e correções:** não executado. Registrar se o bloqueio ocorreu corretamente. Corrigir mensagens ou regras de autenticação caso necessário.

##### T4 – Cadastro de treino personalizado

- **Objetivo do teste:** verificar o cadastro de treino com nome e tipo (RF-03, CF-03). A inclusão de exercícios e metas é validada em T15.
- **Nível:** integração · **Tipo:** funcional
- **Pré-condições:** usuário autenticado; acesso ao formulário de treino; nome e tipo válidos.
- **Procedimento:** informar nome e tipo de treino, salvar e conferir os dados na lista do usuário.
- **Resultado esperado:** o treino é validado, salvo no banco de dados e exibido na lista de treinos do usuário.
- **Resultado da execução e correções:** não executado. Caso o treino não seja salvo ou apresente dados incorretos, registrar o defeito e a correção aplicada.

##### T5 – Validação de treino incompleto

- **Objetivo do teste:** verificar se o sistema impede o cadastro de um treino sem informações obrigatórias.
- **Nível:** integração · **Tipo:** funcional / validação
- **Pré-condições:** usuário autenticado; acesso à tela de criação de treino.
- **Procedimento:** deixar nome ou tipo obrigatório vazio, tentar salvar e verificar a mensagem e a ausência de persistência.
- **Resultado esperado:** o sistema impede o salvamento e informa quais campos precisam ser preenchidos. Nenhum registro incompleto é criado.
- **Resultado da execução e correções:** não executado. Registrar o resultado e corrigir validações ausentes, se necessário.

##### T6 – Alteração de treino existente

- **Objetivo do teste:** verificar se o usuário consegue alterar as informações de um treino já cadastrado.
- **Nível:** integração · **Tipo:** funcional
- **Pré-condições:** usuário autenticado; existência de um treino salvo.
- **Procedimento:** editar nome e tipo do treino, salvar e recarregar a visualização.
- **Resultado esperado:** as alterações são salvas e aparecem corretamente na visualização do treino.
- **Resultado da execução e correções:** não executado. Registrar o resultado e eventuais correções na tela ou na API.

##### T7 – Exclusão de treino

- **Objetivo do teste:** verificar se o usuário consegue excluir um treino já cadastrado.
- **Nível:** sistema · **Tipo:** funcional
- **Pré-condições:** usuário autenticado; existência de treino salvo.
- **Procedimento:** cancelar uma exclusão e verificar a permanência do treino; repetir confirmando a exclusão e consultar a lista.
- **Resultado esperado:** o sistema solicita confirmação, exclui o treino após a confirmação e remove o item da listagem. Se o usuário cancelar, o treino permanece salvo.
- **Resultado da execução e correções:** não executado. Registrar se a confirmação e a exclusão funcionaram corretamente.

##### T8 – Registro de exercício realizado

- **Objetivo do teste:** verificar o registro da execução de um exercício, com carga, repetições, séries e tempo (RF-11, CF-04).
- **Nível:** integração · **Tipo:** funcional
- **Pré-condições:** usuário autenticado; existência de treino cadastrado.
- **Procedimento:** registrar a execução do exercício com os valores de carga, repetições, séries e tempo; recarregar o histórico e comparar os valores.
- **Resultado esperado:** o exercício é marcado como realizado, o histórico é atualizado e as informações são persistidas pelo banco de dados.
- **Resultado da execução e correções:** não executado. Registrar o resultado e corrigir problemas de persistência ou duplicidade, caso encontrados.

##### T9 – Atualização de métricas de evolução

- **Objetivo do teste:** verificar se o registro de exercícios atualiza corretamente a frequência, cargas e demais estatísticas.
- **Nível:** sistema · **Tipo:** funcional
- **Pré-condições:** usuário autenticado; existência de exercícios realizados com datas e cargas registradas.
- **Procedimento:** inserir registros com datas e cargas conhecidas, consultar as métricas e comparar os indicadores com os registros de origem.
- **Resultado esperado:** os gráficos e indicadores apresentam os dados correspondentes aos exercícios realizados.
- **Resultado da execução e correções:** não executado. Comparar os dados exibidos com os dados armazenados e registrar eventuais correções.

##### T10 – Pontuação e conquista por assiduidade

- **Objetivo do teste:** verificar se o sistema libera conquistas por assiduidade de acordo com os critérios definidos para RF-22.
- **Nível:** integração · **Tipo:** funcional / gamificação
- **Pré-condições:** usuário autenticado; critérios de conquista definidos; registros de assiduidade preparados.
- **Procedimento:** preparar registros que atendam e que não atendam aos critérios de conquista definidos para RF-22; processar a assiduidade e conferir o perfil.
- **Resultado esperado:** o sistema exibe a conquista no perfil somente quando os critérios de assiduidade são atingidos.
- **Resultado da execução e correções:** não executado. Conferir os cálculos e registrar correções em caso de pontuação incorreta.

##### T11 – Restrição do painel de admin

- **Objetivo do teste:** verificar se somente os usuários autorizados conseguem acessar funcionalidades administrativas.
- **Nível:** integração · **Tipo:** não funcional / segurança / autorização
- **Pré-condições:** existência de um usuário comum e um usuário administrador.
- **Procedimento:** tentar acessar painel e rotas administrativas com usuário comum; repetir com administrador autorizado.
- **Resultado esperado:** o usuário comum não consegue acessar o painel administrativo. O administrador consegue acessá-lo normalmente.
- **Resultado da execução e correções:** não executado. Registrar o resultado e corrigir permissões ou validações de acesso, caso necessário.

##### T12 – Login com Google

- **Objetivo do teste:** verificar a autenticação opcional com o Google (RF-24, CF-09), após a implementação prevista nas Sprints finais.
- **Nível:** integração · **Tipo:** funcional / autenticação
- **Pré-condições:** integração com o Google implementada e configurada; conta Google válida; serviço de autenticação disponível.
- **Procedimento:** iniciar o login pelo Google, autorizar o consentimento e conferir o acesso; verificar que o login local continua disponível.
- **Resultado esperado:** após autorização e validação da autenticação com o Google, o usuário acessa o sistema com seu perfil. O login com e-mail e senha permanece disponível.
- **Resultado da execução e correções:** não executado. Execução prevista nas Sprints finais, caso RF-24 seja implementado. Registrar resultado observado, correções e reexecuções.

##### T13 – Falha ou cancelamento no login com Google

- **Objetivo do teste:** verificar que falhas ou cancelamento na autenticação com o Google não liberam acesso e não impedem o uso do login com e-mail e senha (RF-24, CF-09).
- **Nível:** integração · **Tipo:** funcional / segurança
- **Pré-condições:** integração com o Google implementada; falha de autenticação, indisponibilidade do serviço ou cancelamento pelo usuário; conta local válida para verificar o acesso com e-mail e senha.
- **Procedimento:** iniciar o login pelo Google, cancelar o consentimento e conferir a ausência de sessão; simular indisponibilidade do provedor e verificar o login local.
- **Resultado esperado:** o sistema não autentica o usuário pelo Google, informa a falha ou cancelamento e mantém disponível o acesso com e-mail e senha. Credenciais locais válidas permitem acessar o sistema.
- **Resultado da execução e correções:** não executado. Execução prevista nas Sprints finais, caso RF-24 seja implementado. Registrar resultado observado, correções e reexecuções.

##### T14 – Listagem de treinos

- **Objetivo do teste:** validar a listagem de treinos (RF-04, CF-03).
- **Nível:** sistema · **Tipo:** funcional
- **Pré-condições:** usuário autenticado; treinos próprios e de outro usuário cadastrados.
- **Procedimento:** abrir a lista de treinos; comparar com os registros do usuário; selecionar um treino já montado e adicioná-lo à lista.
- **Resultado esperado:** exibir os treinos próprios e permitir adicionar um treino já montado; não expor treinos privados de outro usuário.
- **Resultado da execução e correções:** não executado; evidência não disponível; reparos não registrados; zero ciclos executados.

##### T15 – Cadastro de exercício no treino

- **Objetivo do teste:** validar o cadastro de exercício no treino (RF-07, CF-04).
- **Nível:** integração · **Tipo:** funcional
- **Pré-condições:** usuário autenticado; treino próprio cadastrado; exercício predefinido disponível.
- **Procedimento:** selecionar o exercício, informar a meta e salvar; repetir sem exercício ou meta obrigatória.
- **Resultado esperado:** exercício válido vinculado ao treino com a meta informada; dados obrigatórios ausentes impedem o cadastro.
- **Resultado da execução e correções:** não executado; evidência não disponível; reparos não registrados; zero ciclos executados.

##### T16 – Listagem de exercícios

- **Objetivo do teste:** validar a listagem de exercícios (RF-08, CF-04).
- **Nível:** sistema · **Tipo:** funcional
- **Pré-condições:** usuário autenticado; treino com exercícios e treino sem exercícios.
- **Procedimento:** abrir os dois treinos e conferir os exercícios exibidos.
- **Resultado esperado:** exibir os nomes e metas corretos de cada treino; apresentar estado vazio quando não houver exercícios.
- **Resultado da execução e correções:** não executado; evidência não disponível; reparos não registrados; zero ciclos executados.

##### T17 – Alteração de exercício

- **Objetivo do teste:** validar a alteração de exercício (RF-09, CF-04).
- **Nível:** integração · **Tipo:** funcional
- **Pré-condições:** usuário autenticado; exercício vinculado a treino próprio.
- **Procedimento:** alterar as metas, salvar e recarregar a tela.
- **Resultado esperado:** informações alteradas persistidas e exibidas; demais exercícios mantidos.
- **Resultado da execução e correções:** não executado; evidência não disponível; reparos não registrados; zero ciclos executados.

##### T18 – Exclusão de exercício

- **Objetivo do teste:** validar a exclusão de exercício (RF-10, CF-04).
- **Nível:** sistema · **Tipo:** funcional
- **Pré-condições:** usuário autenticado; treino próprio com dois exercícios.
- **Procedimento:** remover um exercício e recarregar a lista.
- **Resultado esperado:** exercício removido da lista do treino; outro exercício mantido.
- **Resultado da execução e correções:** não executado; evidência não disponível; reparos não registrados; zero ciclos executados.

##### T19 – Acompanhamento de recorde pessoal

- **Objetivo do teste:** validar o acompanhamento de recorde pessoal (RF-20, CF-05).
- **Nível:** sistema · **Tipo:** funcional
- **Pré-condições:** usuário autenticado; funcionalidade de PR implementada; exercício com meta de recorde pessoal.
- **Procedimento:** cadastrar a meta de recorde pessoal no campo do exercício, salvar, consultar e atualizar o acompanhamento.
- **Resultado esperado:** meta e acompanhamento de recorde pessoal persistidos e exibidos corretamente, sem alterar registros de outros exercícios.
- **Resultado da execução e correções:** não executado; evidência não disponível; reparos não registrados; zero ciclos executados.

##### T20 – Usabilidade do MVP

- **Objetivo do teste:** validar a usabilidade do MVP (RF-01 a RF-11).
- **Nível:** sistema · **Tipo:** não funcional / usabilidade
- **Pré-condições:** MVP disponível; conta de teste; navegador em telas móvel e desktop.
- **Procedimento:** executar cadastro, login, criação de treino, inclusão de exercício e registro de execução; verificar navegação por teclado, legibilidade, mensagens e adaptação da tela.
- **Resultado esperado:** fluxos concluídos sem bloqueios de navegação, campos ou botões inacessíveis, texto ilegível ou sobreposição; mensagens orientam a correção de entradas inválidas.
- **Resultado da execução e correções:** não executado; evidência não disponível; reparos não registrados; zero ciclos executados.

##### T21 – Token Google inválido ou expirado

- **Objetivo do teste:** validar o tratamento de token Google inválido ou expirado (RF-24, CF-09).
- **Nível:** integração · **Tipo:** funcional / segurança
- **Pré-condições:** RF-24 implementado; resposta de autenticação simulável com token inválido e expirado.
- **Procedimento:** enviar cada token ao retorno da autenticação Google e tentar acessar rota protegida.
- **Resultado esperado:** tokens rejeitados sem criação de sessão; acesso protegido negado; login local permanece disponível.
- **Resultado da execução e correções:** não executado; evidência não disponível; reparos não registrados; zero ciclos executados.

##### T22 – Rota protegida sem sessão

- **Objetivo do teste:** validar rota protegida sem sessão (RF-02, CF-02; RF-24, CF-09 quando implementado).
- **Nível:** integração · **Tipo:** funcional / segurança
- **Pré-condições:** aplicação disponível; nenhuma sessão autenticada.
- **Procedimento:** acessar diretamente uma rota protegida pela interface e pela API, sem sessão; repetir após encerramento da sessão.
- **Resultado esperado:** acesso negado sem exposição de dados; interface encaminha ao login e API retorna resposta de não autorização.
- **Resultado da execução e correções:** não executado; evidência não disponível; reparos não registrados; zero ciclos executados.

---

## Referências

1. MOORE, Geoffrey A. *Crossing the chasm: marketing and selling high-tech products to mainstream customers.* New York: Harper Business, 1991.
2. MARCZEWSKI, Andrzej. User Types. In: MARCZEWSKI, Andrzej. *Even ninja monkeys like to play: gamification, game thinking and motivational design.* 1. ed. [S.l.]: CreateSpace Independent Publishing Platform, 2015. p. 65–80.
3. TONDELLO, Gustavo F. et al. The gamification user types Hexad scale. In: ANNUAL SYMPOSIUM ON COMPUTER-HUMAN INTERACTION IN PLAY, 2016, Austin. *Proceedings* [...]. New York: ACM (Association for Computing Machinery), 2016. p. 229–243. DOI (Digital Object Identifier, identificador digital de objeto): 10.1145/2967934.2968082.
4. PRESSMAN, Roger S.; MAXIM, Bruce R. *Engenharia de software: uma abordagem profissional.* 8. ed. Porto Alegre: AMGH, 2016.
5. SCHWABER, Ken; SUTHERLAND, Jeff. *O Guia do Scrum: o guia definitivo para o Scrum: as regras do jogo.* 2020.
6. BASILI, Victor R.; CALDIERA, Gianluigi; ROMBACH, H. Dieter. The goal question metric approach. In: MARCINIAK, John J. (ed.). *Encyclopedia of software engineering.* New York: John Wiley & Sons, 1994. v. 1, p. 528–532.
7. KRUCHTEN, Philippe; NORD, Robert L.; OZKAYA, Ipek. *Managing technical debt: reducing friction in software development.* Boston: Addison-Wesley, 2019.
8. BRASIL. Ministério do Planejamento, Orçamento e Gestão. *Guia de contagem de pontos de função do MP* (Ministério do Planejamento). Versão 1.0. Brasília, 2015. Disponível em: [https://bibliotecadigital.gestao.gov.br/handle/777/235](https://bibliotecadigital.gestao.gov.br/handle/777/235). Acesso em: 30 set. 2026.
9. HEVY. *Gym progress.* Disponível em: [https://www.hevyapp.com/features/gym-progress/](https://www.hevyapp.com/features/gym-progress/). Acesso em: 30 set. 2026.
10. STRONG. *Workout tracker and gym log.* Disponível em: [https://www.strong.app/](https://www.strong.app/). Acesso em: 30 set. 2026.
11. JEFIT. *Workout logging app.* Disponível em: [https://www.jefit.com/use-case/workout-logging-app](https://www.jefit.com/use-case/workout-logging-app). Acesso em: 30 set. 2026.
12. AMERICAN SOCIETY FOR QUALITY (ASQ). *Fishbone diagram.* [S.l.], [s.d.]. Disponível em: [https://asq.org/quality-resources/fishbone](https://asq.org/quality-resources/fishbone). Acesso em: 30 set. 2026.
