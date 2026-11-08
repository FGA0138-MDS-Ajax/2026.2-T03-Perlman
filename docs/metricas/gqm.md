# 5 Métricas e medições

Para assegurar a saúde e a transparência do projeto, aplicamos a abordagem GQM (Goal-Question-Metric, objetivo–questão–métrica) estruturada para garantir rastreabilidade entre as metas de negócio e as métricas operacionais coletadas [6].

## 5.1 O quadro GQM estruturado e questões

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

## 5.2 Fichas de detalhamento das métricas (5W1H, escalas e análises)

5W1H reúne seis perguntas: What (o quê), Why (por quê), Who (quem), Where (onde), When (quando) e How (como).

### Métrica 1 (M1): throughput (vazão) de issues por Sprint

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

### Métrica 2 (M2): densidade de defeitos

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

### Métrica 3 (M3): percentual de cobertura de testes (coverage)

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

### Métrica 4 (M4): dívida técnica (débito técnico)

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

*As fontes citadas entre colchetes estão em [Referências](../referencias.md).*
