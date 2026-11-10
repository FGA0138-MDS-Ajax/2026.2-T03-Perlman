# Medições do GQM

Valores medidos das métricas M1 a M4 definidas no [Quadro GQM](gqm.md), comparados às metas.

**Data da medição:** 09/11/2026 · **Código medido:** branch `integracao`, commit `32ced1b` (06/11/2026)

## Resumo

| Métrica | Meta | Medido | Situação |
| :-- | :-- | :-- | :-- |
| M1 — Throughput por sprint | 4 a 6 por sprint | 0, 0, 5, 6 e 2 PRs nas Sprints 3 a 7 | Atingida em 2 das 5 sprints de desenvolvimento |
| M2 — Densidade de defeitos | ≤ 0,2 bug/issue | — | Não mensurável |
| M3 — Cobertura de testes | ≥ 70% das linhas | 82,0% no back-end | Atingida no back-end; front-end sem medição |
| M4 — Dívida técnica | Nota A, zero críticos | — | Não mensurável |

!!! warning "Fontes de dados ainda não configuradas"
    O GQM prevê o GitHub Projects e issues com a label `bug` (M1 e M2), o GitHub Actions (M3) e o SonarQube (M4). Na data da medição, o repositório não tinha issues, labels, workflow de CI para o código nem análise estática. As medições abaixo usam as fontes disponíveis e indicam as adaptações feitas.

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

**Análise:** as Sprints 3 e 4 ficaram abaixo da meta, e a regra da ficha da M1 ("abaixo da meta por duas sprints, renegociar o escopo") já se aplicava ao fim da Sprint 4. Na Sprint 7, a integração do front-end (5 commits na branch `frontend/treinos`) foi feita sem Pull Request, por isso não aparece na contagem.

## M2 — Densidade de defeitos

**Não mensurável.** Não há issues com a label `bug`, e os 22 casos do [Roteiro de Teste](../testes/roteiro.md) continuam como "Não executado". O único commit de correção (`fix: corrigir configuração dos testes`) ajusta a configuração dos testes, não um defeito do produto.

**Para medir:** registrar cada defeito como issue com a label `bug` durante a rotina de testes definida na ata nº 7.

## M3 — Cobertura de testes

**Medição:** testes do back-end executados com `mvn verify`, com relatório gerado pelo JaCoCo, que já está configurado no `pom.xml` com mínimo de 70% de linhas.

| Indicador | Cobertos | Total | Percentual |
| :-- | :-: | :-: | :-: |
| **Linhas** | 821 | 1001 | **82,0%** |
| Ramos (branches) | 132 | 232 | 56,9% |
| Métodos | 308 | 343 | 89,8% |

| Pacote | Linhas cobertas |
| :-- | :-: |
| controller | 98,9% |
| entity | 97,8% |
| security | 97,6% |
| service | 93,0% |
| exception | 89,5% |
| config | 58,0% |
| bootstrap (dados demonstrativos) | 15,0% |

**Execução dos testes:**

- **Back-end:** 181 de 187 testes passaram. Os 6 restantes (`MotivaFItApplicationTests`) dependem do Docker (Testcontainers), indisponível no ambiente da medição. Como esses testes não rodaram, a cobertura real pode ser um pouco maior.
- **Front-end:** os 36 testes de interface (Vitest) passaram. O front-end não tem ferramenta de cobertura configurada, então a fórmula da ficha, que soma as linhas do back-end e do front-end, não pôde ser calculada.

**Análise:** o back-end atinge a meta de 70%. O bloqueio automático de merge previsto na ficha não está ativo, porque o limite do JaCoCo só é verificado quando alguém roda o build localmente: não há workflow de CI. A cobertura de ramos (56,9%) indica condições de regra de negócio sem teste do caminho alternativo.

**Para reproduzir:** em `backend/MotivaFIt`, com Java 25 e Docker, rode `mvn verify` e abra `target/site/jacoco/index.html`.

## M4 — Dívida técnica

**Não mensurável.** O repositório não tem SonarQube ou outra ferramenta de análise estática configurada.

**Para medir:** o SonarCloud é gratuito para repositórios públicos e pode rodar no mesmo workflow de CI que verificaria a M3.

## Avaliação dos objetivos

Comparação dos resultados medidos com os objetivos definidos no [Quadro GQM](gqm.md).

| Objetivo | Meta definida | Resultado | Situação |
| :-- | :-- | :-- | :-- |
| **G1** Cadência de entrega | 4 a 6 entregas por sprint | Sprints 3 e 4 com 0, Sprint 5 com 5, Sprint 6 com 6 e Sprint 7 com 2 | **Parcial:** atingida em 2 das 5 sprints de desenvolvimento |
| **G2** Estabilidade do software | ≤ 0,2 bug por issue | Sem dados | **Não avaliável** |
| **G3** Proteção contra regressões | ≥ 70% de cobertura, com bloqueio automático no CI | 82,0% no back-end, sem CI e sem medição no front-end | **Parcial:** a meta numérica foi atingida, mas o mecanismo previsto não existe |
| **G4** Manutenibilidade | Nota A e zero falhas críticas | Sem ferramenta de análise | **Não avaliável** |

### Pontos de atenção

- **As regras de ação não foram aplicadas.** A ficha da M1 determina renegociar o escopo com o cliente depois de duas sprints abaixo da meta. Essa condição já valia ao fim da Sprint 4, com zero entregas nas Sprints 3 e 4. Nenhuma ata registra a renegociação, e o cronograma seguiu acumulando atraso (média de 2,6 sprints, ver [Medições do Processo](medicoes-processo.md)).
- **A M1 foi medida de forma adaptada.** O quadro GQM define a contagem por issues concluídas no GitHub Projects. Como o repositório não tem issues, foram contados Pull Requests mesclados, uma aproximação razoável que não é a métrica exatamente como definida.
- **A G3 foi atingida só em parte.** O objetivo fala em proteção "no contexto da integração contínua", mas os 82,0% vêm de uma execução manual. Sem workflow de CI, nada impede que um Pull Request reduza a cobertura. A cobertura de ramos, de 56,9%, indica caminhos alternativos das regras de negócio sem teste.
- **G2 e G4 dependem de configurações ainda não feitas.** A ata nº 4 registra a configuração das métricas M1 a M4 como concluída, mas issues, label `bug`, CI e análise estática não existem no repositório (ver [Conferência das Atas](conferencia-atas.md), item 3.2).

### Plano de ação

| Nº | Ação | Libera | Observação |
| :-: | :-- | :-: | :-- |
| 1 | Registrar cada tarefa como issue, associada à sprint, e usar a label `bug` para defeitos | M1 e M2 | Inclui registrar como issue cada defeito encontrado na rotina de testes da ata nº 7 |
| 2 | Criar um workflow de CI que rode os testes com o JaCoCo e bloqueie Pull Requests abaixo de 70% | M3 | O limite já está configurado no `pom.xml`; falta executá-lo automaticamente |
| 3 | Configurar uma ferramenta de cobertura no front-end | M3 | Necessária para a fórmula da ficha, que soma back-end e front-end |
| 4 | Adicionar o SonarCloud, gratuito para repositórios públicos, ao mesmo workflow | M4 | — |
| 5 | Registrar em ata a renegociação do escopo para as sprints restantes, priorizando os itens *Must* do MoSCoW | G1 | Prevista na ficha da M1; pendente desde a Sprint 4 |

---

*Medição feita em cópia isolada da branch `integracao`, sem alterar o repositório.*
