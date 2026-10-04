| Versão | Data | Descrição da Alteração | Nome(s) Integrante(s) |
| :----: | :--: | :--------------------: | :-------------------: |
| 1.0 | 30/09/2026 | Criação da ata | Bruno Cruvinel Barros da Silva |

# Ata de Reunião nº 3 — MotivaFit

**Disciplina:** Métodos de Desenvolvimento de Software  
**Projeto:** MotivaFit  
**Equipe:** Grupo Perlman — T03  
**Tipo de reunião:** Interna da equipe  
**Data:** 30/09/2026  
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

1. Revisão dos encaminhamentos da reunião nº 2
2. Métricas e medições: quadro GQM e fichas das métricas (tópico 5 do documento de visão)
3. Testes de software: estratégia, roteiro e casos de teste (tópico 6)
4. Revisão geral do documento de visão e fechamento da versão 1.0.0
5. Encaminhamentos e próxima reunião

## 3. Revisão dos encaminhamentos anteriores

Encaminhamentos da ata nº 2.

| Ação | Responsável | Status |
| :-- | :-- | :-- |
| Elaborar o documento de arquitetura (prazo: 04/10/2026) | Toda a equipe | Concluída |
| Criar a estrutura base do projeto, back-end (prazo: 04/10/2026) | Back-end (Matheus Estevam, Luís e Lucas) | Concluída (estrutura criada, sem funcionalidades implementadas) |
| Rever o documento de visão e preparar a pauta de revisão da próxima reunião | Bruno Cruvinel Barros da Silva | Concluída (realizada nesta reunião) |

## 4. Discussões e decisões

### 4.1 Métricas e medições (tópico 5)
- **Discussão:** a equipe definiu como vai acompanhar a saúde do projeto, usando a abordagem GQM (Goal-Question-Metric), que liga cada objetivo a uma questão e a uma métrica. As fichas de detalhamento seguem o formato 5W1H.
- **Decisões:**

| Objetivo | Métrica | Meta | O que acontece se a meta não for atingida |
| :-- | :-- | :-- | :-- |
| G1 — Cadência de entrega por sprint | M1: throughput de issues | 4 a 6 issues concluídas por sprint | Duas sprints abaixo da meta levam à renegociação do escopo do backlog com o cliente |
| G2 — Estabilidade do software | M2: densidade de defeitos | até 0,2 bug por issue concluída | A sprint seguinte trava novas funcionalidades e se dedica à correção de bugs |
| G3 — Proteção contra regressões | M3: cobertura de testes | no mínimo 70% de cobertura de linhas | O CI bloqueia o merge de Pull Requests que reduzam a cobertura abaixo da meta |
| G4 — Manutenibilidade | M4: dívida técnica | zero falhas críticas e classificação A | Qualquer defeito crítico ou bloqueante gera prioridade máxima de refatoração |

  - **Fontes de dados:** board do GitHub Projects (M1), issues com a label `bug` (M2), logs do GitHub Actions (M3) e ferramenta de análise estática, como o SonarQube (M4).
  - **Periodicidade:** M1 e M2 ao fim de cada sprint (na Review); M3 a cada abertura ou atualização de Pull Request; M4 por escaneamento diário na pipeline.
  - **Responsáveis:** o Analista de Qualidade (Bernardo) acompanha M1 e M2 com os desenvolvedores; M3 fica com os desenvolvedores e o QA; M4 é de toda a equipe de engenharia.

### 4.2 Testes de software (tópico 6)
- **Discussão:** a equipe definiu a estratégia de testes e revisou o roteiro com os casos de teste planejados.
- **Decisões:**
  - **Níveis:** unitário, integração (rotas da API com o PostgreSQL e telas do front-end com o back-end) e sistema (fluxo completo do usuário).
  - **Tipos:** foco em testes funcionais (regras de negócio, autenticação com e-mail e senha, CRUD) e testes não funcionais de usabilidade e adaptação a diferentes telas.
  - **Ambientes:** local, para criar e rodar os testes na branch da funcionalidade, e Integração Contínua, em que o GitHub Actions executa os testes em containers Docker a cada Pull Request. O merge só é autorizado com a pipeline aprovada.
  - **Falhas:** o Analista de Qualidade examina o erro com os desenvolvedores responsáveis e acompanha a correção até a nova aprovação dos testes.
  - **Roteiro:** 22 casos de teste (T1 a T22), organizados em uma tabela de planejamento (tipo, nível, pré-condições e resultado previsto) e outra de execução (resultado obtido, evidência, reparos e ciclos).
  - **Cronograma de execução:**
    - T1 a T8, T14 a T18 e T22: Sprints 3 e 4;
    - T20 (usabilidade do MVP): Sprint 4;
    - T9 (métricas): Sprint 5;
    - T19 (recorde pessoal): Sprint 8;
    - T10 (conquistas): Sprint 9;
    - T11 (restrição do painel administrativo): acompanha a entrega das funcionalidades administrativas;
    - T12, T13 e T21 (login com o Google): dependem de RF-24, nas Sprints 9 e 10.
  - **Casos ainda a detalhar:** os testes de RF-13 a RF-19, RF-21 e RF-23 serão definidos antes da sprint de implementação de cada requisito, com atualização da matriz de rastreabilidade.
  - **Situação atual:** nenhum teste foi executado até aqui, então todos os casos aparecem como "Não executado", com zero ciclos. Casos apenas planejados não são evidência de ausência de defeitos. Um caso só é aprovado quando o resultado obtido corresponde ao previsto.

### 4.3 Revisão geral do documento de visão (versão 1.0.0)
- **Discussão:** a equipe revisou o documento inteiro, corrigindo pontos apontados na síntese, e fechou a versão 1.0.0 (a versão 0.1.0 é de 22/09/2026).
- **Decisões:** foram ajustados os seguintes pontos:
  - A análise de concorrência (Hevy, Strong e JEFIT) deixou de pressupor exclusividade das funcionalidades do MotivaFit.
  - Cada tipo do modelo Hexad passou a indicar os requisitos e os testes que o atendem, deixando explícito quais não têm teste planejado no MVP.
  - O percentual acumulado das sprints passou a ser descrito como cobertura funcional planejada, e não como progresso real. RF-24 ficou fora do cálculo até receber estimativa.
  - Os resultados de testes passaram a declarar que ainda não há execução registrada.
  - As referências foram atualizadas, com data de acesso em 30/09/2026.
  - O histórico de revisões registra a versão 1.0.0 com o texto "Revisão conforme apontamentos da síntese".

## 5. Encaminhamentos (plano de ação)

| Nº | Ação | Responsável | Prazo | Status |
| :-: | :-- | :-- | :-: | :-: |
| 1 | Criar a estrutura base do front-end | Front-end (Rafael Laube e Mateus Fernandes) | 04/10/2026 | Pendente |
| 2 | Configurar o acompanhamento das métricas M1 a M4 (GitHub Projects, label `bug`, cobertura e análise estática) | Bernardo Campos Caxito Silveira | Antes da Sprint 3 (05/10/2026) | Pendente |
| 3 | Detalhar os casos de teste de RF-13 a RF-19, RF-21 e RF-23 | Bernardo Campos Caxito Silveira | Antes da sprint de implementação de cada requisito | Pendente |
| 4 | Atualizar o registro de execução dos testes após cada teste executado | Bernardo e desenvolvedores responsáveis por cada funcionalidade | Contínuo, a cada teste | Pendente |

## 6. Riscos e impedimentos
- Nenhum impedimento novo foi relatado nesta reunião. Os riscos do projeto seguem os registrados na ata nº 2.

## 7. Próxima reunião
- **Data:** 04/10/2026, às 15h
- **Local:** Discord
- **Pauta preliminar:** acompanhamento da Sprint 2 (arquitetura e estrutura base) e planejamento da Sprint 3 (cadastro, login e treinos).

---

## 8. Aprovação
Ata redigida por **Bruno Cruvinel Barros da Silva** e revisada pela equipe em 02/10/2026.