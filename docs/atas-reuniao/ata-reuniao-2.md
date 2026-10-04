| Versão | Data | Descrição da Alteração | Nome(s) Integrante(s) |
| :----: | :--: | :--------------------: | :-------------------: |
| 1.0 | 28/09/2026 | Criação da ata | Bruno Cruvinel Barros da Silva |

# Ata de Reunião nº 2 — MotivaFit

**Disciplina:** Métodos de Desenvolvimento de Software  
**Projeto:** MotivaFit  
**Equipe:** Grupo Perlman — T03  
**Tipo de reunião:** Interna da equipe  
**Data:** 28/09/2026  
**Horário:** início 20h00 — término 23h00  
**Local:** Discord  
**Redator:** Bruno Cruvinel Barros da Silva  
**Facilitador:** Mateus Fernandes Dantas (líder da equipe)

---

## 1. Participantes

| Nome | Papel | Situação |
| :-- | :-- | :-- |
| Bernardo Campos Caxito Silveira | GQM / Analista de Qualidade | Presente |
| Bruno Cruvinel Barros da Silva | Documentação | Presente |
| Lucas Venâncio Pereira | Back-end | Presente |
| Luís Felipe Pontes Vieira Andrade | Back-end | Presente |
| Mateus Fernandes Dantas | Front-end (líder) | Presente |
| Matheus Estevam Ferreira | Back-end | Presente |
| Rafael Souto Lopes Laube | Front-end | Presente |

## 2. Pauta

1. Revisão dos encaminhamentos da reunião nº 1
2. Conclusão da declaração de escopo: cenários, backlog, descrição dos requisitos e rastreabilidade (tópico 4 do documento de visão)
3. Gerenciamento de riscos e critérios de replanejamento (tópicos 2.5 e 2.6)
4. Processo de desenvolvimento de software (tópico 3)
5. Início da Sprint 2: documento de arquitetura e estrutura base
6. Encaminhamentos e próxima reunião

## 3. Revisão dos encaminhamentos anteriores

Encaminhamentos da ata nº 1 (prazo: 27/09/2026).

| Ação | Responsável | Status |
| :-- | :-- | :-- |
| Concluir o detalhamento do backlog do produto (cenários, requisitos e user stories) | Matheus Estevam Ferreira e Rafael Souto Lopes Laube | Concluída / Em andamento / Pendente |
| Consolidar e formatar o documento de visão com o conteúdo definido na reunião | Bruno Cruvinel Barros da Silva | Concluída / Em andamento / Pendente |
| Validar a priorização dos requisitos (MoSCoW) com o Dono do Produto | Mateus Fernandes Dantas | Concluída / Em andamento / Pendente |
| Elaborar as métricas (GQM) e a estratégia de testes | Bernardo Campos Caxito Silveira | Concluída / Em andamento / Pendente |
| Revisar o conteúdo técnico (tecnologias e arquitetura) | Lucas Venâncio Pereira e Luís Felipe Pontes Vieira Andrade | Concluída / Em andamento / Pendente |

## 4. Discussões e decisões

### 4.1 Conclusão da declaração de escopo (tópico 4)
- **Discussão:** a equipe deu continuidade ao backlog iniciado na reunião nº 1, detalhando os cenários de uso, os requisitos funcionais e a ligação entre eles.
- **Decisões:**
  - **Cenários funcionais (CF-01 a CF-09):** cadastro e login com e-mail e senha; gerenciamento de treinos e de exercícios; acompanhamento da evolução; desafios e comparação com amigos; convite de administrador; painel administrativo; e login opcional com o Google.
  - **Backlog:** definidos os requisitos RF-01 a RF-24, cada um com cenário, sprint prevista, prioridade MoSCoW, estimativa preliminar e user story.
  - **MVP (Sprint 4):** RF-01 a RF-11, ou seja, cadastro e login, gerenciamento de treinos e gerenciamento e registro de exercícios. RF-12 (métricas de evolução) é obrigatório, mas fica para a Sprint 5, após o MVP.
  - **Priorização:** itens essenciais como Must; painel administrativo e funcionalidades sociais de maior valor como Should; convite de administrador e login com o Google como Could. A priorização ainda precisa ser validada pelo Dono do Produto.
  - **Estimativas:** valores preliminares de planejamento, sem equivalência direta em horas ou em contagem formal de pontos de função. RF-24 (login com o Google) ficou sem estimativa até o refinamento.
  - **Rastreabilidade:** a matriz liga cada problema ou cenário a perfil, requisitos, testes planejados e métrica.

### 4.2 Gerenciamento de riscos e critérios de replanejamento (tópicos 2.5 e 2.6)
- **Discussão:** a equipe identificou os principais riscos do projeto e definiu o que provoca um replanejamento.
- **Decisões:**
  - **Riscos registrados:**
    - atraso nas entregas por causa do ciclo de uma semana (grau alto): tarefas não concluídas voltam ao backlog e são replanejadas para a sprint seguinte, sem aumentar a duração da sprint;
    - saída de membro da equipe (grau baixo): incentivo ao Pair Programming, documentação sempre atualizada e redistribuição imediata das tarefas críticas;
    - falha na integração com o Google (grau médio): testes isolados no Postman antes da integração, mantendo o login com e-mail e senha;
    - desalinhamento com as expectativas do cliente (grau baixo): envolver o cliente nas Sprint Reviews e deixar claro que a entrega é incremental.
  - **Critérios de replanejamento:** saída de integrante, alteração estrutural de escopo, atraso crítico em requisitos Must e acúmulo de dívida técnica. Todo replanejamento gera uma nova versão do documento de visão.

### 4.3 Processo de desenvolvimento de software (tópico 3)
- **Discussão:** a equipe detalhou como o Scrum e as práticas de XP serão aplicadas no dia a dia.
- **Decisões:**
  - Desenvolvimento guiado por testes contínuos e Pair Programming, com Code Review constante e Integração Contínua via GitHub Actions.
  - Aplicação dos princípios SOLID e de Clean Code no desenvolvimento em Java/Spring Boot.
  - **A equipe não adotará a Daily Scrum**, porque a disponibilidade dos integrantes impede encontros diários. Os impedimentos serão comunicados pelos canais do grupo e nas reuniões semanais de acompanhamento.

### 4.4 Início da Sprint 2 (28/09 a 04/10/2026)
- **Discussão:** a equipe planejou a Sprint 2, cujo foco é preparar a base técnica do projeto.
- **Decisões:**
  - Entregáveis da sprint: documento de arquitetura e estrutura base do projeto (back-end).
  - A sprint tem como responsável toda a equipe.

## 5. Encaminhamentos (plano de ação)

| Nº | Ação | Responsável | Prazo | Status |
| :-: | :-- | :-- | :-: | :-: |
| 1 | Elaborar o documento de arquitetura | Toda a equipe | 04/10/2026 | Pendente |
| 2 | Criar a estrutura base do projeto (back-end) | Back-end (Matheus Estevam, Luís e Lucas) | 04/10/2026 | Pendente |
| 3 | Rever o documento de visão e preparar a pauta de revisão da próxima reunião | Bruno Cruvinel Barros da Silva | 30/09/2026 | Pendente |

## 6. Riscos e impedimentos
- Os riscos do projeto foram registrados no item 4.2. Nenhum impedimento novo foi relatado nesta reunião.

## 7. Próxima reunião
- **Data:** 30/09/2026, às 20h
- **Local:** Discord
- **Pauta preliminar:** revisão do documento de visão (métricas GQM, testes de software e ajustes gerais).

---

## 8. Aprovação
Ata redigida por **Bruno Cruvinel Barros da Silva** e revisada pela equipe em 01/10/2026.