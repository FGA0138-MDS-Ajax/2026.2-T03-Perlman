# Conferência das Atas

Esta página confere cada encaminhamento registrado nas atas de reunião com as evidências do repositório (commits, Pull Requests, branches e documentos). Ela é a base das [Medições do Processo](medicoes-processo.md).

**Data da conferência:** 09/11/2026 · **Fontes:** atas nº 1 a 7, branches `developer`, `integracao`, `frontend/treinos`, `test/smoke-api` e `docs`, e Pull Requests #1 a #13.

## Critérios de classificação

| Status verificado | Quando se aplica |
| :-- | :-- |
| **Concluída no prazo** | Há evidência de conclusão até a data do prazo. |
| **Concluída com atraso** | Há evidência de conclusão depois do prazo (o atraso é contado em dias). |
| **Concluída (sem prazo)** | Há evidência de conclusão, mas a ata não definiu prazo ou a data de conclusão não foi registrada. |
| **Em andamento** | Há evidência de execução parcial. |
| **Pendente vencida** | O prazo passou e não há evidência de conclusão. |
| **Pendente no prazo** | O prazo ainda não venceu ou não foi definido. |
| **Sem evidência** | A ação não foi revisada em nenhuma ata posterior e não há rastro verificável dela. |

Ações combinadas fora do repositório (apresentações, mensagens, contato com o monitor) são aceitas conforme registradas na ata, já que não deixam rastro no GitHub.

## Encaminhamentos conferidos

### Ata nº 1 — 22/09/2026

| Item | Ação | Prazo | Status na ata seguinte | Status verificado | Evidência |
| :-: | :-- | :-: | :-- | :-- | :-- |
| 1.1 | Concluir o detalhamento do backlog | 27/09 | Não preenchido | Concluída com atraso (1 dia) | RF-01 a RF-24 definidos na reunião de 28/09 (ata nº 2, item 4.1). |
| 1.2 | Consolidar o documento de visão | 27/09 | Não preenchido | Concluída com atraso (3 dias) | Versão 1.0.0 publicada em 30/09 (commit `docs:documento-de-visao-v1.0.0`). |
| 1.3 | Validar a priorização MoSCoW com o Dono do Produto | 27/09 | Não preenchido | Sem evidência | A ata nº 2 afirma que a priorização "ainda precisa ser validada"; o tema não volta em nenhuma ata. |
| 1.4 | Elaborar as métricas (GQM) e a estratégia de testes | 27/09 | Não preenchido | Concluída com atraso (3 dias) | Definidas na reunião de 30/09 (ata nº 3, itens 4.1 e 4.2). |
| 1.5 | Revisar o conteúdo técnico | 27/09 | Não preenchido | Sem evidência | Nenhuma ata ou commit registra essa revisão. |

### Ata nº 2 — 28/09/2026

| Item | Ação | Prazo | Status na ata seguinte | Status verificado | Evidência |
| :-: | :-- | :-: | :-- | :-- | :-- |
| 2.1 | Elaborar o documento de arquitetura | 04/10 | Concluída (ata nº 3, 30/09) | Concluída no prazo | Versão 1.0 de 03/10/2026; reunião dedicada em 04/10 (ata nº 4). A ata nº 3 marcou como concluída antes de o documento existir. |
| 2.2 | Criar a estrutura base do back-end | 04/10 | Concluída (ata nº 3, 30/09) | Concluída com atraso (16 dias) | Primeiro código do back-end no PR #1, mesclado em 20/10. |
| 2.3 | Rever o documento de visão e preparar a pauta | 30/09 | Concluída | Concluída no prazo | Revisão feita na reunião de 30/09. |

### Ata nº 3 — 30/09/2026

| Item | Ação | Prazo | Status na ata seguinte | Status verificado | Evidência |
| :-: | :-- | :-: | :-- | :-- | :-- |
| 3.1 | Criar a estrutura base do front-end | 04/10 | Concluída (ata nº 4) / Em andamento (ata nº 5) | Concluída com atraso (21 dias) | Primeiro commit do front-end em 25/10 (`Feat:Base estrutural do frontend`). |
| 3.2 | Configurar o acompanhamento das métricas M1 a M4 | 05/10 | Concluída (ata nº 4) | Pendente vencida | O repositório não tem issues, labels, workflow de CI nem análise estática. Só o limite de 70% de cobertura do JaCoCo foi configurado, em 24/10. |
| 3.3 | Detalhar os casos de teste de RF-13 a RF-19, RF-21 e RF-23 | Antes de cada sprint | Concluída (ata nº 4) | Em andamento | O roteiro cita RF-13, RF-19, RF-21 e RF-23, mas não tem casos para RF-14 a RF-18. |
| 3.4 | Atualizar o registro de execução dos testes | Contínuo | Concluída (ata nº 4) / Pendente (ata nº 6) | Pendente vencida | Os 22 casos do roteiro continuam como "Não executado"; a rodada de testes da API de 08/11 não foi registrada neles. |

### Ata nº 4 — 04/10/2026

| Item | Ação | Prazo | Status na ata seguinte | Status verificado | Evidência |
| :-: | :-- | :-: | :-- | :-- | :-- |
| 4.1 | Apresentar o documento de arquitetura ao professor | 19/10 | Concluída (ata nº 6) | Concluída no prazo | Registrado na ata nº 6. |

### Ata nº 5 — 12/10/2026

| Item | Ação | Prazo | Status na ata seguinte | Status verificado | Evidência |
| :-: | :-- | :-: | :-- | :-- | :-- |
| 5.1 | Definir quem apresenta os documentos | 14/10 e 19/10 | Concluída | Concluída (sem prazo) | Registrado na ata nº 6, sem data de conclusão. |
| 5.2 | Entregar a atividade de métricas detalhadas | 14/10 | Concluída | Concluída (sem prazo) | Registrado na ata nº 6, sem data de conclusão. |
| 5.3 | Apresentar o protótipo do front-end | — | Concluída | Concluída (sem prazo) | Protótipo no Figma apresentado em 26/10. |
| 5.4 | Concluir a estrutura do banco de dados | — | Concluída | Concluída (sem prazo) | Migrations V1 a V5 criadas entre 22/10 e 24/10. |
| 5.6 | Confirmar o calendário de reuniões | Próxima reunião | Não revisado | Sem evidência | O item não aparece na ata nº 6. |

### Ata nº 6 — 26/10/2026

| Item | Ação | Prazo | Status na ata seguinte | Status verificado | Evidência |
| :-: | :-- | :-: | :-- | :-- | :-- |
| 6.1 | Iniciar o site de documentação (MkDocs) | — | Concluída | Concluída (sem prazo) | Reestruturação do site em 27/10 (branch `docs`). |
| 6.2 | Iniciar a elaboração dos testes | — | Em andamento | Concluída (sem prazo) | Testes de fumaça da API publicados em 08/11 (branch `test/smoke-api`) e rodada de testes da API executada no mesmo dia. |
| 6.3 | Desenvolver o front-end seguindo o Figma | — | Em andamento | Em andamento | Telas do MVP concluídas até 06/11; gamificação ainda não iniciada. |
| 6.4 | Definir a data da próxima reunião | — | Concluída | Concluída (sem prazo) | Reunião realizada em 04/11. |

### Ata nº 7 — 04/11/2026

| Item | Ação | Prazo | Status na ata | Status verificado | Evidência |
| :-: | :-- | :-: | :-- | :-- | :-- |
| 7.1 | Integrar o back-end com o front-end | 07/11 | Pendente | Concluída no prazo | Cinco commits de integração no front-end entre 05/11 e 06/11, reunidos na branch `integracao` em 06/11. O relatório de testes de 08/11 ainda não verificou o fluxo pela interface do front-end. |
| 7.2 | Reunião de integração | 05/11 | Pendente | Concluída no prazo | Evidência indireta: PRs #12 e #13 e commits de integração de três integrantes em 05/11. Não há ata dessa reunião. |
| 7.3 | Rotina de testes após a integração | Após a integração | Pendente | Em andamento | Rodada de testes da API executada em 08/11 pelo Bernardo, com 8 verificações aprovadas (ver [Relatório de Testes da API](../testes/relatorio-testes-api.md)). A rotina de um teste por dia e os testes em desktop e celular ainda não estão comprovados. |
| 7.4 | Subir os documentos de testes | — | Pendente | Concluída (sem prazo) | Registro dos testes de fumaça publicado em 08/11 na branch `test/smoke-api` (ainda não mesclada) e relatório da rodada de testes entregue para a documentação em 09/11. O campo de resultado do registro de fumaça segue em branco. |
| 7.5 | Confirmar alterações nas APIs | — | Pendente | Pendente no prazo | O código mostra que houve alterações (ver [divergências](#divergencias-encontradas)). |
| 7.6 | Verificar a viabilidade do recorde pessoal e do feed | 09/11 | Pendente | Pendente no prazo | Sem registro até a data da conferência. |
| 7.7 | Contatar o líder do grupo Torvalds | Antes de 16/11 | Pendente | Pendente no prazo | Ação fora do repositório. |
| 7.8 | Inspecionar o grupo Torvalds | 16/11 | Pendente | Pendente no prazo | Prazo ainda não venceu. |
| 7.9 | Tirar a dúvida sobre o MVP publicado com o monitor | A definir | Pendente | Pendente no prazo | Ação fora do repositório. |
| 7.10 | Enviar ao grupo o resumo da reunião | 04/11 | Pendente | Sem evidência | Envio por mensagem, sem rastro verificável. A ata foi criada em 05/11. |

## Entregas sem registro nas atas

Estas entregas estão no repositório, mas nenhuma ata as menciona. Elas foram consideradas nas medições.

| Data | Entrega | Evidência |
| :-: | :-- | :-- |
| 24/10 | Testes automatizados do back-end e limite mínimo de 70% de cobertura (JaCoCo) | Commit `test: feita toda a cobertura de testes` (PR #2) |
| 29/10 | Docker Compose da aplicação e dos testes | PR #6 |
| 31/10 | Rotas de exercícios dentro do treino | PR #7 |
| 31/10 | Registro diário de treino (execução) | PR #8 |
| 31/10 | Remoção do Lombok | PR #9 |
| 31/10 | Convite de administradores e criação do superusuário | PR #10 |
| 31/10 | Testes de exercícios e de administração | PR #11 |
| 05/11 | Inserção de exercícios no treino | PR #12 |
| 05/11 | Dados demonstrativos para apresentação | PR #13 |
| 05/11 a 06/11 | Front-end integrado: autenticação, catálogo, CRUD de treinos, exercícios da ficha, cópia de treinos públicos, registros de execução, histórico e indicadores pessoais | Branch `frontend/treinos`, reunida em `integracao` |
| 08/11 | Testes de fumaça da API | Branch `test/smoke-api` |
| 08/11 | Rodada de testes da API por `curl` (8 verificações aprovadas) | [Relatório de Testes da API](../testes/relatorio-testes-api.md) |

## Divergências encontradas

### Status declarados sem evidência

- **Ata nº 3:** marca o documento de arquitetura e a estrutura base do back-end como concluídos em 30/09. O documento é de 03/10, e o código do back-end só aparece em 20/10.
- **Ata nº 4:** marca como concluídos os quatro encaminhamentos da ata nº 3. A estrutura do front-end só aparece em 25/10, as métricas M1 a M4 não foram configuradas, os casos de RF-14 a RF-18 não existem e o registro de execução continua vazio.
- **Ata nº 5:** registra a estrutura do front-end como "Em andamento", contradizendo a ata nº 4.
- **Ata nº 6:** registra o registro de execução dos testes como "Pendente", contradizendo a ata nº 4.

### Informações desatualizadas

- **Back-end:** a ata nº 7 diz que "praticamente nada falta no back-end até o painel administrativo". O back-end não tem rotas de painel administrativo (frequência média, ranking ou exercícios mais realizados) nem de desafios. Em `/api/admin` existem apenas os convites de administrador.
- **API:** o [Guia da API](../produto/guia-api.md), de 27/10, diz que adicionar exercícios ao treino e registrar execução "ainda não existe". Desde então foram criadas as rotas `/api/treinos/{treinoId}/exercicios`, `/api/treinos/{id}/adicionar`, `/api/registros` e `/api/admin/convites`. Isso também responde ao item 7.5: houve alterações nas APIs.

### Problemas de preenchimento

- **Ata nº 2:** a revisão dos encaminhamentos ficou com o texto do modelo (`Concluída / Em andamento / Pendente`) em todos os itens.
- **Ata nº 4:** a tabela de encaminhamentos não tem a coluna "Responsável", e o prazo aparece no lugar dela.
- **Ata nº 5:**
    - o título diz "Ata de Reunião nº 4";
    - a revisão diz tratar dos encaminhamentos da ata nº 3, mas deveria revisar os da ata nº 4;
    - três status da revisão ficaram vazios;
    - a numeração dos encaminhamentos pula o item 5;
    - os itens 3 e 4 não têm prazo nem status.
- **Ata nº 6:** o item 4.1 anuncia uma "Comparação com o planejamento das sprints" que ficou vazia.
- **Ata nº 7:**
    - a lista de participantes inclui os integrantes do back-end, que não estavam presentes segundo o item 4.2, e não registra a chegada tardia de Bernardo;
    - a aprovação está datada de 07/12/2026, uma data futura;
    - o item 4 tem "Pendente" na coluna de prazo;
    - o item 5 não tem responsável definido.
- **Atas nº 4 a 7:** não registram a presença (coluna "Situação").
- **Reuniões sem ata:** a reunião de integração de 05/11 e a reunião prevista para 17 ou 18/10 não têm ata.
