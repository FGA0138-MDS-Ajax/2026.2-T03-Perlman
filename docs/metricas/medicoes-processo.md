# Medições do Processo

Métricas de acompanhamento do processo da equipe, calculadas a partir das atas de reunião e conferidas com o repositório (commits, Pull Requests e branches).

**Data da medição:** 09/11/2026 · **Período:** Sprints 1 a 7 (22/09 a 08/11/2026)

## Resumo

| Métrica | Resultado |
| :-- | :-- |
| Taxa de conclusão dos encaminhamentos | **67%** (18 de 27 com prazo vencido ou já concluídos) |
| Pontualidade dos encaminhamentos | **50%** concluídos no prazo; atraso médio de **8,8 dias** |
| Confiabilidade dos status registrados | **57%** das conclusões declaradas tinham evidência na data |
| Encaminhamentos com prazo definido | **59%** (19 de 32) |
| Sprints com reunião registrada | **5 de 7** |
| Atraso médio das entregas em relação ao cronograma | **2,6 sprints** |
| Pull Requests com revisão de código | **0%** (0 de 13) |

## P1 — Taxa de conclusão dos encaminhamentos

**Cálculo:** encaminhamentos concluídos ÷ encaminhamentos que já deveriam estar concluídos. Os 5 encaminhamentos da ata nº 7 cujo prazo ainda não venceu ficam fora da conta.

| Ata | Encaminhamentos | Concluídos | Em andamento | Pendentes vencidos ou sem evidência | Ainda no prazo |
| :-: | :-: | :-: | :-: | :-: | :-: |
| 1 | 5 | 3 | 0 | 2 | 0 |
| 2 | 3 | 3 | 0 | 0 | 0 |
| 3 | 4 | 1 | 1 | 2 | 0 |
| 4 | 1 | 1 | 0 | 0 | 0 |
| 5 | 5 | 4 | 0 | 1 | 0 |
| 6 | 4 | 3 | 1 | 0 | 0 |
| 7 | 10 | 3 | 1 | 1 | 5 |
| **Total** | **32** | **18** | **3** | **6** | **5** |

**Resultado:** 18 ÷ 27 = **67%**. Considerando todos os 32, a taxa é de 56%.

## P2 — Pontualidade

**Cálculo:** encaminhamentos concluídos até o prazo ÷ encaminhamentos concluídos que tinham prazo em data. A definição de quem apresenta os documentos e a entrega da atividade de métricas (ata nº 5) ficam de fora porque a ata não registrou a data de conclusão.

| Item | Ação | Prazo | Conclusão | Atraso |
| :-: | :-- | :-: | :-: | :-: |
| 1.1 | Detalhamento do backlog | 27/09 | 28/09 | 1 dia |
| 1.2 | Documento de visão | 27/09 | 30/09 | 3 dias |
| 1.4 | Métricas (GQM) e estratégia de testes | 27/09 | 30/09 | 3 dias |
| 2.1 | Documento de arquitetura | 04/10 | 03/10 | no prazo |
| 2.2 | Estrutura base do back-end | 04/10 | 20/10 | 16 dias |
| 2.3 | Revisão do documento de visão | 30/09 | 30/09 | no prazo |
| 3.1 | Estrutura base do front-end | 04/10 | 25/10 | 21 dias |
| 4.1 | Apresentação da arquitetura | 19/10 | até 19/10 | no prazo |
| 7.1 | Integração back-end e front-end | 07/11 | 06/11 | no prazo |
| 7.2 | Reunião de integração | 05/11 | 05/11 | no prazo |

**Resultado:** 5 de 10 no prazo = **50%**. Entre os atrasados, o atraso médio é de (1 + 3 + 3 + 16 + 21) ÷ 5 = **8,8 dias**. Os maiores atrasos estão na estrutura base do código, o que empurrou o cronograma inteiro (ver P6).

## P3 — Confiabilidade dos status registrados

**Cálculo:** conclusões declaradas nas atas que tinham evidência na data da reunião ÷ total de conclusões declaradas.

- **Conclusões declaradas:** 14 (ata nº 3: 3; ata nº 4: 4; ata nº 6: 5; ata nº 7: 2).
- **Sem evidência na data:** 6. São o documento de arquitetura e a estrutura base do back-end, marcados como concluídos na ata nº 3, e os quatro encaminhamentos da ata nº 3 marcados como concluídos na ata nº 4: estrutura base do front-end, acompanhamento das métricas M1 a M4, casos de teste de RF-13 a RF-23 e registro de execução dos testes.
- **Resultado:** 8 ÷ 14 = **57%**.

Além disso, a revisão da ata nº 2 não foi preenchida (5 itens), e a da ata nº 5 tem 3 status em branco.

## P4 — Encaminhamentos com prazo definido

**Cálculo:** encaminhamentos com prazo em data ÷ total. Prazos relativos, como "contínuo", "após a integração" e "a definir", não contam.

| Ata | 1 | 2 | 3 | 4 | 5 | 6 | 7 | Total |
| :-- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Com prazo em data | 5 de 5 | 3 de 3 | 2 de 4 | 1 de 1 | 2 de 5 | 0 de 4 | 6 de 10 | **19 de 32 (59%)** |

Sem prazo, não é possível medir atraso. A ata nº 6 não definiu prazo para nenhum encaminhamento.

## P5 — Reuniões

| Ata | Data | Sprint | Duração | Presença registrada |
| :-: | :-: | :-: | :-: | :-- |
| 1 | 22/09 | 1 | 159 min | 7 de 7 |
| 2 | 28/09 | 2 | 180 min | 7 de 7 |
| 3 | 30/09 | 2 | 180 min | 7 de 7 |
| 4 | 04/10 | 2 | 150 min | Não registrada |
| 5 | 12/10 | 4 | 20 min | Não registrada |
| 6 | 26/10 | 6 | 45 min | Não registrada |
| 7 | 04/11 | 7 | 20 min | Não registrada; o texto indica 4 de 7 |

- **Frequência:** 7 reuniões em 44 dias, com intervalo médio de 7,2 dias. O maior intervalo foi de 14 dias, entre 12/10 e 26/10; a reunião prevista para 17 ou 18/10 não tem ata.
- **Cobertura:** as Sprints 3 e 5 não tiveram reunião registrada, e a reunião de integração de 05/11 também não tem ata.
- **Duração:** média de 108 minutos. As atas nº 1 a 4 têm média de 167 minutos, e as nº 5 a 7, de 28 minutos.
- **Presença:** só pode ser medida nas atas nº 1 a 3 (100%). Na ata nº 7, o texto informa a ausência dos três integrantes do back-end, embora a lista de participantes inclua todos.

## P6 — Aderência ao cronograma das sprints

**Cálculo:** sprint em que a entrega apareceu no repositório menos a sprint planejada na ata nº 1.

| Entrega | Sprint planejada | Entrega no repositório | Sprint real | Desvio |
| :-- | :-: | :-: | :-: | :-: |
| Estrutura base do back-end | 2 | 20/10 | 5 | +3 |
| Estrutura base do front-end | 2 | 25/10 | 5 | +3 |
| Cadastro e login | 3 | 24/10 | 5 | +2 |
| Gerenciamento de treinos | 3 | 24/10 | 5 | +2 |
| Gerenciamento e registro de exercícios | 4 | 05/11 | 7 | +3 |
| MVP integrado (back-end e front-end) | 4 | 06/11 | 7 | +3 |
| Métricas do usuário (indicadores no front-end) | 5 | 06/11 | 7 | +2 |
| Painel administrativo (frequência média e ranking) | 5 e 6 | — | Não iniciado no back-end | ≥ +2 |
| Exercícios mais realizados e desafios | 7 | — | Não iniciado | — |

**Resultado:** entre as 7 entregas concluídas, o desvio médio é de 18 ÷ 7 = **2,6 sprints**. Restam 3 sprints (8 a 10) para as entregas das Sprints 5 a 9 que ainda não começaram.

## P7 — Revisão de código nos Pull Requests

**Fonte:** API do GitHub (Pull Requests #1 a #13).

**Resultado:** **0 de 13** PRs receberam revisão ou comentário, e todos foram mesclados pelo próprio autor. A revisão de código (Code Review) foi definida como prática da equipe nas atas nº 1 e 2, mas não há registro dela no repositório.

---

*Todas as medições usam as datas dos commits e merges no horário de Brasília. Ações combinadas fora do repositório foram consideradas conforme registradas nas atas.*
