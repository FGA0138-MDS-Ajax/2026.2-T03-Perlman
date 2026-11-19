# Medições do GQM

Valores medidos das métricas M1 a M4 definidas no [Quadro GQM](gqm.md), comparados às metas.

**Data da medição:** 18/11/2026 · **Código medido:** branch `developer`, commit `8d27ae3` (18/11/2026). A medição anterior, de 09/11/2026, usou a branch `integracao` (commit `32ced1b`).

## Resumo

| Métrica | Meta | Medido | Situação |
| :-- | :-- | :-- | :-- |
| M1 — Throughput por sprint | 4 a 6 por sprint | 0, 0, 5, 6, 2 e 2 PRs nas Sprints 3 a 8; 5 na Sprint 9 até 18/11 | Atingida em 2 das 6 sprints de desenvolvimento encerradas |
| M2 — Densidade de defeitos | ≤ 0,2 bug/issue | 1 defeito identificado e corrigido em 8 verificações; nenhuma issue com a label `bug` | Não mensurável pela fórmula |
| M3 — Cobertura de testes | ≥ 70% das linhas | 83,6% no back-end, com 10 testes falhando | Atingida no back-end; front-end sem medição |
| M4 — Dívida técnica | Nota A, zero críticos | — | Não mensurável |

!!! warning "Fontes de dados ainda não configuradas"
    O GQM prevê o GitHub Projects e issues com a label `bug` (M1 e M2), o GitHub Actions (M3) e o SonarQube (M4). Na data da medição, o repositório tinha 4 issues (#15 a #18, abertas em 10/11) com labels de área, mas nenhuma com a label `bug`, e não tinha workflow de CI para o código nem análise estática. As medições abaixo usam as fontes disponíveis e indicam as adaptações feitas.

## M1 — Throughput

**Adaptação:** sem issues no repositório, a medição conta os **Pull Requests mesclados** na branch `developer` em cada sprint.

| Sprint | Período | PRs mesclados | Meta (4 a 6) |
| :-: | :-- | :-: | :-- |
| 1 | 22/09 a 27/09 | 0 | Sprint de documentação |
| 2 | 28/09 a 04/10 | 0 | Sprint de documentação |
| 3 | 05/10 a 11/10 | 0 | Abaixo |
| 4 | 12/10 a 18/10 | 0 | Abaixo |
| 5 | 19/10 a 25/10 | 5 (#1 a #5) | Atingida |
| 6 | 26/10 a 01/11 | 6 (#6 a #11) | Atingida |
| 7 | 02/11 a 08/11 | 2 (#12 e #13) | Abaixo |
| 8 | 09/11 a 15/11 | 2 (#14 e #19) | Abaixo |
| 9 | 16/11 a 22/11 | 5 (#21 a #25) até 18/11 | Em andamento |

**Análise:** as Sprints 3 e 4 ficaram abaixo da meta, e a regra da ficha da M1 ("abaixo da meta por duas sprints, renegociar o escopo") já se aplicava ao fim da Sprint 4. A integração do front-end, feita na Sprint 7 em 5 commits na branch `frontend/treinos`, entrou na `developer` pelo PR #14, em 09/11, e por isso conta na Sprint 8. Além dos PRs, houve commits diretos na `developer`: 5 na Sprint 8 e 4 na Sprint 9 até 18/11.

## M2 — Densidade de defeitos

**Não mensurável pela fórmula da ficha**, porque não há issues concluídas nem issues com a label `bug`. As 4 issues abertas em 10/11 (#15 a #18) usam apenas labels de área (`frontend` e `backend`).

Há, porém, uma rodada de testes executada em 09/11 pelo Bernardo (ver [Relatório de Testes da API](../testes/relatorio-testes-api.md)):

- 8 verificações executadas e 8 aprovadas;
- 1 defeito identificado: marcadores de conflito do Git em `pagina-principal.tsx`, presentes na branch `developer` e removidos na `integracao` pelo commit `150abe5` (05/11);
- indicador provisório, fora da fórmula da ficha: 1 defeito para 8 verificações.

Os 22 casos do [Roteiro de Teste](../testes/roteiro.md) continuam como "Não executado", porque a rodada ainda não foi registrada neles. Entre 09/11 e 18/11, a `developer` recebeu 9 commits de correção (`fix:`), como `fix: corrigir calculo de pace na evolucao` e `fix: resolvido bug de excluir usuário`, mas nenhum deles está associado a uma issue, o que impede o cálculo pela fórmula.

**Para medir:** registrar cada defeito como issue com a label `bug` durante a rotina de testes definida na ata nº 7.

## M3 — Cobertura de testes

**Medição:** testes do back-end executados com `mvn verify`, com relatório gerado pelo JaCoCo, que já está configurado no `pom.xml` com mínimo de 70% de linhas.

| Indicador | Cobertos | Total | Percentual |
| :-- | :-: | :-: | :-: |
| **Linhas** | 1049 | 1255 | **83,6%** |
| Ramos (branches) | 181 | 321 | 56,4% |
| Métodos | 397 | 431 | 92,1% |

Na medição de 09/11, a cobertura de linhas era de 82,0% (821 de 1001).

| Pacote | Linhas cobertas |
| :-- | :-: |
| metricas | 100,0% |
| controller | 99,2% |
| security | 97,6% |
| entity | 96,4% |
| exception | 94,7% |
| config | 92,3% |
| service | 86,6% |
| bootstrap (dados demonstrativos) | 15,0% |

**Execução dos testes:**

- **Back-end:** 216 de 226 testes passaram, incluindo os que dependem do Docker (Testcontainers). Os 10 que falham estão em três classes:
    - `CatalogoExercicioAdminServiceTest` (4): os testes criam exercícios sem imagem, que passou a ser obrigatória;
    - `GoogleAuthServiceTest` (5): uso incorreto de *argument matchers* do Mockito na preparação dos testes;
    - `ExercicioServiceTest` (1): efeito do mesmo erro de Mockito, que o próprio relatório aponta em `GoogleAuthServiceTest`.
- **Front-end:** 58 de 64 testes de interface (Vitest) passaram. Os 6 que falham estão em `auth.test.tsx` (2: o texto esperado na tela de treinos mudou) e `theme.test.tsx` (4: os testes esperam o tema salvo pela API, mas `preferencias-api.ts` passou a usar o `localStorage`). O teste do cliente HTTP (`http-client.test.mjs`) não rodou, porque depende de um Node com suporte a `--experimental-strip-types`. O front-end não tem ferramenta de cobertura configurada, então a fórmula da ficha, que soma as linhas do back-end e do front-end, não pôde ser calculada.

**Análise:** o back-end atinge a meta de 70%. Os testes que falham não acompanharam mudanças recentes no código, e sem workflow de CI ninguém foi avisado: o limite do JaCoCo só é verificado quando alguém roda o build localmente. A cobertura de ramos (56,4%) indica condições de regra de negócio sem teste do caminho alternativo.

**Para reproduzir:** em `backend/MotivaFIt`, com Java 25 e Docker, rode `mvn verify` e abra `target/site/jacoco/index.html`.

## M4 — Dívida técnica

**Não mensurável.** O repositório não tem SonarQube ou outra ferramenta de análise estática configurada.

**Para medir:** o SonarCloud é gratuito para repositórios públicos e pode rodar no mesmo workflow de CI que verificaria a M3.

## Avaliação dos objetivos

Comparação dos resultados medidos com os objetivos definidos no [Quadro GQM](gqm.md).

| Objetivo | Meta definida | Resultado | Situação |
| :-- | :-- | :-- | :-- |
| **G1** Cadência de entrega | 4 a 6 entregas por sprint | Sprints 3 e 4 com 0, Sprint 5 com 5, Sprint 6 com 6, Sprints 7 e 8 com 2; Sprint 9 com 5 até 18/11 | **Parcial:** atingida em 2 das 6 sprints de desenvolvimento encerradas |
| **G2** Estabilidade do software | ≤ 0,2 bug por issue | Rodada de 09/11: 8 verificações aprovadas e 1 defeito corrigido; nenhuma issue com a label `bug` | **Não avaliável pela fórmula** |
| **G3** Proteção contra regressões | ≥ 70% de cobertura, com bloqueio automático no CI | 83,6% no back-end, sem CI, sem medição no front-end e com 16 testes falhando | **Parcial:** a meta numérica foi atingida, mas o mecanismo previsto não existe |
| **G4** Manutenibilidade | Nota A e zero falhas críticas | Sem ferramenta de análise | **Não avaliável** |

### Pontos de atenção

- **As regras de ação não foram aplicadas.** A ficha da M1 determina renegociar o escopo com o cliente depois de duas sprints abaixo da meta. Essa condição já valia ao fim da Sprint 4, com zero entregas nas Sprints 3 e 4. Nenhuma ata registra a renegociação, e o cronograma seguiu acumulando atraso (média de 2,6 sprints, ver [Medições do Processo](medicoes-processo.md)).
- **A M1 foi medida de forma adaptada.** O quadro GQM define a contagem por issues concluídas no GitHub Projects. Como o repositório não tem issues, foram contados Pull Requests mesclados, uma aproximação razoável que não é a métrica exatamente como definida.
- **A G3 foi atingida só em parte.** O objetivo fala em proteção "no contexto da integração contínua", mas os 83,6% vêm de uma execução manual. Sem workflow de CI, nada impede que um Pull Request reduza a cobertura ou quebre testes: hoje 10 testes do back-end e 6 do front-end falham. A cobertura de ramos, de 56,4%, indica caminhos alternativos das regras de negócio sem teste.
- **Os testes ainda não cobrem a interface.** A rodada de 09/11 validou a API e o banco por `curl`; o fluxo pelas telas do front-end ainda não foi testado, e o cadastro duplicado (409) e a persistência após a criação de treino seguem pendentes.
- **G2 e G4 dependem de configurações ainda não feitas.** A ata nº 4 registra a configuração das métricas M1 a M4 como concluída. As issues começaram a ser usadas em 10/11, mas a label `bug`, o CI e a análise estática ainda não existem no repositório.

### Plano de ação

| Nº | Ação | Libera | Observação |
| :-: | :-- | :-: | :-- |
| 1 | Registrar cada tarefa como issue, associada à sprint, e usar a label `bug` para defeitos | M1 e M2 | Iniciado em 10/11 (#15 a #18). Inclui registrar como issue cada defeito encontrado na rotina de testes da ata nº 7 |
| 2 | Criar um workflow de CI que rode os testes com o JaCoCo e bloqueie Pull Requests abaixo de 70% | M3 | O limite já está configurado no `pom.xml`; falta executá-lo automaticamente |
| 3 | Configurar uma ferramenta de cobertura no front-end | M3 | Necessária para a fórmula da ficha, que soma back-end e front-end |
| 4 | Adicionar o SonarCloud, gratuito para repositórios públicos, ao mesmo workflow | M4 | — |
| 5 | Registrar em ata a renegociação do escopo para as sprints restantes, priorizando os itens *Must* do MoSCoW | G1 | Prevista na ficha da M1; pendente desde a Sprint 4 |
| 6 | Atualizar os testes que falham na `developer` (10 no back-end e 6 no front-end) | M3 | Os testes não acompanharam mudanças recentes no código |

---

*Medição feita em cópia isolada da branch `developer`, sem alterar o repositório.*
