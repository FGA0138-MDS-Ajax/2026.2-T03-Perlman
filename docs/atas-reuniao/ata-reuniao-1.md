| Versão | Data | Descrição da Alteração | Nome(s) Integrante(s) |
| :----: | :--: | :--------------------: | :-------------------: |
| 1.0 | 22/09/2026 | Criação do Documento de Visão  | Bruno Cruvinel Barros da Silva |
  
                                                    

# Ata de Reunião nº 1 — MotivaFit

**Disciplina:** Métodos de Desenvolvimento de Software  
**Projeto:** MotivaFit  
**Equipe:** Grupo Perlman — T03  
**Tipo de reunião:** Interna da equipe  
**Data:** 22/09/2026  
**Horário:** início 20h23— término 23h02
**Local:** Discord  
**Redator:** Bruno Cruvinel Barros da Silva  
**Facilitador:** Mateus Fernandes Dantas (líder da equipe)

---

## 1. Participantes

| Nome | Papel | Situação |
| :-- | :-- | :-- |
| Bernardo Campos Caxito Silveira | GQM | Presente |
| Bruno Cruvinel Barros da Silva | Documentação | Presente |
| Lucas Venâncio Pereira | Back-end | Presente |
| Luís Felipe Pontes Vieira Andrade | Back-end | Presente |
| Mateus Fernandes Dantas (líder)| Front-end  | Presente |
| Matheus Estevam Ferreira | Back-end | Presente |
| Rafael Souto Lopes Laube | Front-end | Presente |

## 2. Pauta

1. Visão geral do produto: problema, posicionamento, objetivos e tecnologias (tópico 1 do documento de visão)
2. Visão geral do projeto: ciclo de vida, organização, análise causal, planejamento das sprints e matriz de comunicação (tópicos 2.1 a 2.4)
3. Declaração de escopo: início da elaboração do backlog (tópico 4)
4. Encaminhamentos e próxima reunião

## 3. Revisão dos encaminhamentos anteriores

Não se aplica (primeira reunião da equipe).

## 4. Discussões e decisões

### 4.1 Visão geral do produto (tópico 1)
- **Discussão:** a equipe definiu o problema que o MotivaFit pretende resolver: pessoas que querem treinar com regularidade, mas têm dificuldade de organizar a rotina, acompanhar o progresso e manter a constância, o que gera desmotivação e abandono.
  - **Matheus Estevam Ferreira** e **Rafael Souto Lopes Laube** tiveram participação de destaque na construção deste tópico, incluindo a declaração de posição do produto e a comparação com aplicativos de registro de treino já existentes (Hevy, Strong e JEFIT).
  - **Mateus Fernandes Dantas**, como facilitador, conduziu a discussão e consolidou os objetivos do produto.
  - **Bernardo Campos Caxito Silveira** contribuiu com a relação entre os objetivos do produto e a forma de medir o resultado, o que serviu de base para as métricas (GQM).
- **Decisões:**
  - O MotivaFit será um aplicativo web de saúde e fitness, voltado a iniciantes e a praticantes que desejam acompanhar métricas e comparar desempenho com amigos.
  - Objetivo principal: apoiar a regularidade dos treinos por meio de gamificação, recompensas visuais, organização simplificada e liberdade para montar os próprios treinos.
  - Objetivos secundários: facilitar rotinas com foco em hipertrofia, com divisão muscular correta, e oferecer gráficos de frequência e evolução de cargas.
  - A gamificação seguirá o modelo Hexad (Achiever, Philanthropist, Free Spirit, Player, Socialiser e Disruptor), com uma funcionalidade associada a cada tipo de usuário.
  - Tecnologias escolhidas:
    - **Java/Spring Boot** (back-end) e **PostgreSQL** (banco de dados), com argumentos de **Lucas Venâncio Pereira** e **Luís Felipe Pontes Vieira Andrade** sobre robustez das regras de negócio e integridade dos dados;
    - **React** (front-end), defendido por **Rafael Laube** e **Mateus Fernandes** pela criação de interfaces interativas;
    - **Docker e GitHub Actions** (CI/CD), por sugestão de **Bernardo**, para automatizar testes e entregas;
    - **Git/GitHub** (versionamento).
  - Reuniões pelo Discord/Teams e comunicação pelo grupo de WhatsApp, proposta por **Bruno Cruvinel Barros da Silva** e aceita por todos.

### 4.2 Visão geral do projeto (tópicos 2.1 a 2.4)
- **Discussão:** definiu-se como a equipe vai trabalhar ao longo do semestre.
  - **Matheus** e **Rafael** foram os principais colaboradores na estruturação do planejamento das sprints e na distribuição dos papéis da equipe.
  - **Lucas** e **Luís** avaliaram a viabilidade técnica das entregas de back-end previstas para as Sprints 3 e 4 (cadastro, login, treinos e exercícios).
  - **Bernardo** defendeu a adoção de Code Review e Integração Contínua desde o início, para proteger a qualidade das entregas.
  - **Mateus Fernandes** garantiu que a divisão das sprints respeitasse a disponibilidade dos integrantes.
- **Decisões:**
  - **Ciclo de vida:** desenvolvimento ágil com Scrum, em sprints de uma semana, combinado com práticas de XP (Pair Programming, Code Review e Integração Contínua).
  - **Papéis:** back-end (Matheus Estevam, Luís e Lucas); front-end (Rafael Laube e Mateus Fernandes); documentação (Bruno); analista de qualidade (Bernardo); Dono do Produto (Monitor Daniel); cliente (Ricardo Ajax).
  - **Análise causal (Ishikawa):** o efeito analisado é o abandono das atividades físicas e a desmotivação. As três causas principais são falta de planejamento, ausência de engajamento e falta de percepção de evolução, cada uma ligada a requisitos do produto. O diagrama teve contribuição principal de **Rafael** e **Matheus**.
  - **Planejamento das sprints:** definidas 10 sprints semanais, de 22/09/2026 a 29/11/2026.

| Sprint | Período | Foco |
| :-: | :-: | :-- |
| 1 | 22/09 a 27/09 | Definição do produto, documento de visão e planejamento |
| 2 | 28/09 a 04/10 | Documento de arquitetura, estrutura base e testes |
| 3 | 05/10 a 11/10 | Cadastro e login com e-mail e senha; gerenciamento de treinos |
| 4 | 12/10 a 18/10 | Gerenciamento de exercícios e conclusão do MVP |
| 5 | 19/10 a 25/10 | Métricas do usuário; início do painel administrativo |
| 6 | 26/10 a 01/11 | Painel administrativo: frequência média e ranking |
| 7 | 02/11 a 08/11 | Exercícios mais realizados; submissão de desafios |
| 8 | 09/11 a 15/11 | Recorde pessoal e compartilhamento comunitário |
| 9 | 16/11 a 22/11 | Streak, feed interativo e login com Google (opcional) |
| 10 | 23/11 a 29/11 | Estabilização, correção de bugs e entrega final |

  - **Matriz de comunicação:** reunião semanal de toda a equipe, com ata e relatório de situação do projeto, sob responsabilidade de **Bruno** (documentação); acompanhamento semanal de riscos e pendências; alinhamento de progresso com professor e monitor.

### 4.3 Declaração de escopo (início do tópico 4)
- **Discussão:** a equipe iniciou a definição do escopo, com a elaboração do backlog por meio de brainstorming e da análise do problema.
  - **Matheus** e **Rafael** conduziram o levantamento inicial dos requisitos.
  - **Lucas** e **Luís** contribuíram com os requisitos de autenticação e de cadastro de treinos e exercícios, com foco na parte de back-end.
  - **Bernardo** propôs a classificação dos requisitos pelo método MoSCoW e chamou atenção para a necessidade de requisitos testáveis.
  - **Mateus Fernandes** organizou a discussão sobre os perfis de acesso.
  - **Bruno** registrou os requisitos levantados para compor o documento de visão.
- **Decisões:**
  - O escopo central é uma plataforma em que o atleta amador cria fichas de treino, registra a conclusão dos exercícios e acompanha seu progresso, com gamificação e painel administrativo.
  - Os requisitos serão priorizados pelo método MoSCoW (Must, Should, Could e Won't have), com validação final pelo Dono do Produto.
  - O MVP terá cadastro e login por e-mail e senha, gerenciamento de treinos e gerenciamento e registro de exercícios.
  - Haverá dois perfis de acesso: usuário e administrador.
  - A integração de login com o Google ficou como funcionalidade desejável (Could have), a ser feita conforme a capacidade da equipe.
- **Pendente:** detalhamento dos cenários, da tabela completa de backlog e das user stories.

## 5. Encaminhamentos (plano de ação)

| Nº | Ação | Responsável | Prazo | Status |
| :-: | :-- | :-- | :-: | :-: |
| 1 | Concluir o detalhamento do backlog do produto (cenários, requisitos e user stories) | Matheus Estevam Ferreira e Rafael Souto Lopes Laube | 27/09/2026 | Pendente |
| 2 | Consolidar e formatar o documento de visão com o conteúdo definido na reunião | Bruno Cruvinel Barros da Silva | 27/09/2026 | Pendente |
| 3 | Validar a priorização dos requisitos (MoSCoW) com o Dono do Produto | Mateus Fernandes Dantas | 27/09/2026 | Pendente |
| 4 | Elaborar as métricas (GQM) e a estratégia de testes | Bernardo Campos Caxito Silveira | 27/09/2026 | Pendente |
| 5 | Revisar o conteúdo técnico (tecnologias e arquitetura) | Lucas Venâncio Pereira e Luís Felipe Pontes Vieira Andrade | 27/09/2026 | Pendente |

## 6. Riscos e impedimentos
- Nenhum registrado nesta reunião. O gerenciamento de riscos e os critérios de replanejamento serão tratados em reunião posterior.

## 7. Próxima reunião
- **Data:** 28/09/2026, às 20h
- **Local:** Discord
- **Pauta preliminar:** gerenciamento de riscos, critérios de replanejamento, conclusão do backlog e início do documento de arquitetura (Sprint 2).

---

## 8. Aprovação
Ata redigida por **Bruno Cruvinel Barros da Silva** e revisada pela equipe em 25/09/2026.
