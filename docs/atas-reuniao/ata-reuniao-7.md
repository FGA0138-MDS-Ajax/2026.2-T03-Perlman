| Versão |    Data    | Descrição da Alteração |     Nome(s) Integrante(s)     |
| :-----: | :--------: | :------------------------: | :----------------------------: |
|   1.0   | 05/11/2026 |      Criação da ata      | Bruno Cruvinel Barros da Silva |

# Ata de Reunião nº 7 — MotivaFit

**Disciplina:** Métodos de Desenvolvimento de Software
**Projeto:** MotivaFit
**Equipe:** Grupo Perlman — T03
**Tipo de reunião:** Interna da equipe
**Data:** 04/11/2026
**Horário:** início 19h00 — término 19h20
**Local:** Discord
**Redator:** Bruno Cruvinel Barros da Silva
**Facilitador:** Mateus Fernandes Dantas (líder da equipe)

---

## 1. Participantes

| Nome                               | Papel                       |
| :--------------------------------- | :-------------------------- |
| Bernardo Campos Caxito Silveira    | GQM / Analista de Qualidade |
| Bruno Cruvinel Barros da Silva     | Documentação              |
| Lucas Venâncio Pereira            | Back-end                    |
| Luís Felipe Pontes Vieira Andrade | Back-end                    |
| Mateus Fernandes Dantas            | Front-end (líder)          |
| Matheus Estevam Ferreira           | Back-end                    |
| Rafael Souto Lopes Laube           | Front-end                   |

## 2. Pauta

1. Revisão dos encaminhamentos anteriores
2. Atraso na integração entre back-end e front-end
3. Andamento do front-end e do back-end
4. Rotina de testes
5. Próximas sprints e entregas
6. Ponto de controle (09/11) e inspeções (16/11)
7. Reunião de integração
8. Encaminhamentos e próxima reunião

## 3. Revisão dos encaminhamentos anteriores

Encaminhamentos da ata nº 6 e compromisso de integração combinado para o domingo (01/11).

| Ação                                                                           | Responsável                                | Status                                                                                |
| :------------------------------------------------------------------------------- | :------------------------------------------ | :------------------------------------------------------------------------------------ |
| Integrar o back-end com o front-end (combinado para o domingo, 01/11/2026)       | Back-end e front-end                        | Pendente (não realizada; novo prazo máximo: sábado, 07/11/2026, ver item 4.1)      |
| Iniciar o site de documentação em Markdown (MkDocs / GitHub Pages) (ata nº 6) | Bruno Cruvinel Barros da Silva              | Concluída                                                                            |
| Iniciar a elaboração dos testes (ata nº 6)                                    | Bernardo Campos Caxito Silveira             | Em andamento (testes iniciados na máquina local, nada publicado ainda, ver item 4.4) |
| Desenvolver o front-end seguindo o modelo do Figma (ata nº 6)                   | Front-end (Rafael Laube e Mateus Fernandes) | Em andamento (telas do MVP prontas; falta a parte de gamificação, ver item 4.3)     |
| Definir a data da próxima reunião (ata nº 6)                                  | Toda a equipe                               | Concluída (reunião realizada em 04/11/2026)                                         |

## 4. Discussões e decisões

### 4.1 Atraso na integração entre back-end e front-end

- **Discussão:** a integração do back-end com o front-end estava combinada para o domingo anterior (01/11), pela manhã, mas não aconteceu: o horário não chegou a ser combinado entre os integrantes, e a integração acabou não sendo feita. Foi destacado que se trata de uma pendência urgente, que precisa ser resolvida ainda nesta semana, porque o semestre está acabando e a equipe precisa começar os testes e a correção de bugs o quanto antes.
- **Decisões:**
  - O prazo máximo para concluir a integração passa a ser o **sábado, 07/11/2026**, podendo usar manhã, tarde ou noite, conforme a disponibilidade.
  - O combinado e o novo prazo ficam registrados na ata, e os integrantes foram orientados a conferir o registro.
  - Ficou entendido que o Docker Compose do back-end e o do front-end podem permanecer separados, por organização, e que o trabalho consiste em ligar um ao outro para que o sistema rode de verdade. Não houve objeções.

### 4.2 Reunião de integração

- **Discussão:** como os integrantes do back-end não puderam participar desta reunião, a equipe decidiu combinar o horário da integração pelo grupo. Matheus e Luís responderam, por mensagem, que estão disponíveis no dia seguinte (05/11) a partir das 14h. Um dos integrantes está indisponível das 19h às 21h, e foi sugerido que a reunião possa ser antes desse horário. Para a noite, foi sugerido o horário de 19h, sem que ele seja imposto: vale o horário em que houver mais pessoas disponíveis.
- **Decisões:**
  - A equipe se reunirá no dia **05/11/2026** para trabalhar na integração (front-end e back-end).
  - O horário será escolhido por enquete no grupo de mensagens da equipe, com a sugestão de 19h. Se algum integrante não puder participar, a reunião segue com os que estiverem disponíveis, desde que haja alguém do back-end.
  - Se não for possível integrar a todos em 05/11, a integração pode ser estendida até o sábado (07/11), o limite máximo.

### 4.3 Andamento do front-end e do back-end

- **Discussão:**
  - **Back-end:** foi conferido o que já está pronto em relação à Sprint 7 (painel administrativo, com os exercícios mais realizados, e painel do usuário, com submissão e remoção de desafios). Segundo mensagem de áudio de um dos responsáveis pelo back-end, praticamente nada falta no back-end até o painel administrativo. Foi informado que restava concluir o merge das branches do back-end e que o Matheus havia alterado branches, mas já tinha ajustado.
  - **Front-end:** Rafael montou a estrutura da tela inicial, em que o usuário vê os exercícios e monta seus treinos, e focou no MVP, sem chegar a fazer a parte de comunidade. O front-end informou que o CRUD de treinos e de exercícios, que faz parte do MVP, está pronto, e que as telas estão prontas para a integração: falta apenas puxar os códigos do back-end para o front-end. O que falta no front é a gamificação.
  - **APIs:** foi perguntado se houve alguma alteração relevante nas APIs. Quem estava na reunião informou que não mexeu nelas, e ficou combinado confirmar com os responsáveis pelo back-end.
- **Decisões:**
  - O MVP está concluído em cada lado, e o próximo passo é integrá-los.
  - A confirmação sobre mudanças nas APIs será feita com a equipe do back-end.

### 4.4 Rotina de testes

- **Discussão:** Bernardo entrou no meio da reunião e foi informado do que já tinha sido tratado.
- **Decisões:**
  - Depois que a integração for feita, Bernardo inicia a rotina de testes, com **pelo menos um teste por dia**, cobrindo as funcionalidades do projeto, a partir do roteiro de testes que ele já montou.
  - Bernardo faz o levantamento de todos os bugs e incongruências encontrados.
  - Os testes devem ser feitos **tanto no desktop quanto no celular**, porque o professor pediu compatibilidade com diferentes telas como requisito não funcional.
  - Bernardo informou que já começou alguns testes na noite anterior, mas na máquina local, e que ainda não subiu nada para o GitHub. Ficou combinado que ele subirá os documentos em Markdown (ou outro formato) e enviará a Bruno, no privado, para que as referências entrem na documentação do projeto.

### 4.5 Próximas sprints e entregas

- **Discussão:** foram revisadas as sprints restantes:
  - **Sprint 7 (02/11 a 08/11):** painel administrativo (exercícios mais realizados) e painel do usuário (submissão e remoção de desafios). Essa é a sprint em andamento.
  - **Sprint 8 (09/11 a 15/11):** botão de recorde pessoal e sistema de compartilhamento comunitário (feed interativo).
  - **Sprint 9 (16/11 a 22/11):** inspeções, streak diário (elemento visual), feed de atividades interativo e integração opcional do login com o Google.
  - **Sprint 10 (23/11 a 29/11):** apenas correção de bugs e validação do que faltar.
- A viabilidade das entregas da Sprint 8 depende do back-end, que precisaria implementar o botão de recorde pessoal e o feed. Como a equipe de back-end não estava presente, a resposta ficou para depois da conversa com ela.
- **Decisões:**
  - Fazer a integração nesta semana para ter o MVP rodando.
  - A partir da próxima semana, avaliar se há risco de não conseguir entregar as partes de gamificação planejadas.
  - A apresentação do software rodando está prevista para o dia 30 (30/11/2026).

### 4.6 Ponto de controle e inspeções

- **Discussão:**
  - **Ponto de controle:** segunda-feira, 09/11, e quarta-feira seguinte (11/11). Em cada aula, grupos apresentam o desenvolvimento do software por 15 minutos cada, com presença obrigatória para toda a turma e chamada nas duas aulas. O que será apresentado é o MVP. O objetivo da integração até sábado é ter o projeto integrado no domingo, para saber o que será mostrado.
  - **Presença nas aulas:** a equipe discutiu apresentar logo na segunda para ficar livre na quarta. Na quarta, as opções são ir só para assinar a chamada, ir e concluir o que faltar na própria semana, ou faltar e usar o tempo para o trabalho pendente. A decisão ficou com o grupo.
  - **Inspeções:** no dia 16/11 (segunda). As inspeções são feitas de casa, mas todos precisam se reunir para inspecionar o grupo designado pelo professor. A equipe inspecionará o **grupo Torvalds**. Foi dito que, no momento, não se recomenda adiantar a inspeção: ela deve ser feita no dia 16, prazo dado pelo professor.
  - Foi levantado que é bom ter ao menos o MVP publicado até lá, porque os inspetores podem avaliar a aplicação, e que essa dúvida pode ser confirmada com o monitor.
- **Decisões:**
  - Mateus entrará em contato com o líder do grupo Torvalds para saber exatamente o que será inspecionado, e enviará ao grupo o texto com a descrição do projeto e o link do GitHub deles, para que todos possam se familiarizar.
  - A equipe decidirá, até a segunda, como lidar com a presença da quarta-feira.

## 5. Encaminhamentos (plano de ação)

| Nº | Ação                                                                                                                  | Responsável                                                                            |                 Prazo                 |  Status  |
| :-: | :---------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- | :------------------------------------: | :------: |
|  1  | Integrar o back-end com o front-end                                                                                     | Back-end (Matheus Estevam, Luís e Lucas) e front-end (Rafael Laube e Mateus Fernandes) |      07/11/2026 (limite máximo)      | Pendente |
|  2  | Reunião de integração entre front-end e back-end; definir o horário por enquete no grupo (sugestão: 19h)           | Toda a equipe; enquete por Mateus Fernandes Dantas                                      |               05/11/2026               | Pendente |
|  3  | Iniciar a rotina de testes após a integração: pelo menos 1 teste por dia, levantamento de bugs, em desktop e celular | Bernardo Campos Caxito Silveira                                                         | A partir da conclusão da integração | Pendente |
|  4  | Subir os documentos de testes (Markdown ou outro formato) e enviar a Bruno no privado                                   | Bernardo Campos Caxito Silveira                                                         |                Pendente                |          |
|  5  | Confirmar com o back-end se houve alteração relevante nas APIs                                                        | A confirmar                                                                             |                                        |          |
|  6  | Verificar com o back-end a viabilidade do botão de recorde pessoal e do feed (compartilhamento comunitário)           | A confirmar                                                                             |     Antes da Sprint 8 (09/11/2026)     | Pendente |
|  7  | Contatar o líder do grupo Torvalds e enviar ao grupo a descrição do projeto e o link do GitHub                       | Mateus Fernandes Dantas                                                                 |          Antes de 16/11/2026          | Pendente |
|  8  | Inspecionar o grupo Torvalds                                                                                            | Toda a equipe                                                                           |               16/11/2026               | Pendente |
| 09 | Tirar com o monitor a dúvida sobre ter o MVP publicado para as inspeções                                             | Mateus Fernandes Dantas                                                                 |               A definir               | Pendente |
| 10 | Levantar o que foi tratado na reunião e enviar o resumo ao grupo                                                       | Bruno Cruvinel Barros da Silva                                                          |               04/11/2026               | Pendente |

## 6. Riscos e impedimentos

- **Atraso na integração entre back-end e front-end:** já ocorreu uma vez (domingo, 01/11). O prazo limite agora é sábado, 07/11.
- **Disponibilidade do back-end:** os responsáveis pelo back-end não puderam participar da reunião, o que atrasa a definição da integração e a resposta sobre as entregas da Sprint 8.
- **Entrega da gamificação:** há dúvida se será possível entregar recorde pessoal, feed, streak e login com Google. O risco será reavaliado a partir da próxima semana, depois da integração.
- **Fim do semestre:** a equipe precisa integrar e testar o quanto antes para ter o software rodando na apresentação de 30/11.

## 7. Próxima reunião

- **Data:** 05/11/2026 (reunião de integração entre front-end e back-end)
- **Horário:** a definir por enquete no grupo (sugestão: 19h; Matheus e Luís estão disponíveis a partir das 14h)
- **Local:** Discord
- **Pauta preliminar:** integração entre front-end e back-end; confirmação de mudanças nas APIs; preparação para o ponto de controle de 09/11.

---

## 8. Aprovação

Ata redigida por **Bruno Cruvinel Barros da Silva** e revisada pela equipe em 07/12/2026.
