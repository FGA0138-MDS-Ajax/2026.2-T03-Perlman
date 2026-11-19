| Versão | Data | Descrição da Alteração | Nome(s) Integrante(s) |
| :----: | :--: | :--------------------: | :-------------------: |
| 1.0 | 18/11/2026 | Criação da ata | Bruno Cruvinel Barros da Silva |

# Ata de Reunião nº 8 — MotivaFit

**Disciplina:** Métodos de Desenvolvimento de Software  
**Projeto:** MotivaFit  
**Equipe:** Grupo Perlman — T03  
**Tipo de reunião:** Interna da equipe  
**Data:** 16/11/2026  
**Horário:** início 20h00 — término 20h26  
**Local:** Discord  
**Redator:** Bruno Cruvinel Barros da Silva  
**Facilitador:** Mateus Fernandes Dantas (líder da equipe)

---

## 1. Participantes

| Nome | Papel |
| :-- | :-- |
| Bernardo Campos Caxito Silveira | GQM / Analista de Qualidade |
| Bruno Cruvinel Barros da Silva | Documentação |
| Lucas Venâncio Pereira | Back-end |
| Luís Felipe Pontes Vieira Andrade | Back-end |
| Mateus Fernandes Dantas | Front-end (líder) |
| Matheus Estevam Ferreira | Back-end |
| Rafael Souto Lopes Laube | Front-end |

## 2. Pauta

1. Andamento do back-end (painel administrativo, métricas e desafios)
2. Situação dos testes e das issues abertas no GitHub
3. Planejamento e divisão de tarefas da Sprint atual (penúltima Sprint)
4. Inspeção do repositório do grupo Torvalds
5. Cronograma até a apresentação final

## 3. Revisão dos encaminhamentos anteriores

A revisão dos encaminhamentos da ata nº 7 não foi registrada nesta reunião.

## 4. Discussões e decisões

### 4.1 Andamento do back-end

- **Discussão:**
  - A equipe de back-end vai entregar até 17/11 as métricas do painel administrativo e começou no mesmo dia a funcionalidade de desafios (submissão e remoção).
  - Foi aberto um Pull Request para a branch `developer` com a exclusão e a exportação de conta.
  - Para tornar um usuário administrador: o administrador informa o e-mail, o back-end gera um código de verificação, o código é enviado à pessoa e ela o insere no próprio perfil. Também foi criado um endpoint que lista os usuários da aplicação.

### 4.2 Testes e issues

- **Discussão:**
  - **Bernardo Campos Caxito Silveira** testou o front-end e o back-end, começou os testes de integração e não encontrou novos defeitos. O único problema registrado anteriormente já foi corrigido.
  - Parte das issues abertas por Bernardo no GitHub são ajustes que dependem do front-end ou que ele mesmo pode resolver. A issue de conflito na página principal já pode ser fechada.
  - Foi sugerido que Bernardo grave a execução dos testes, explicando o que está fazendo, e envie o vídeo ao Bruno para facilitar a documentação.

### 4.3 Planejamento da Sprint atual

- **Discussão:**
  - Escopo da Sprint: streak diário (já presente no painel), submissão e remoção de desafios, botão de recorde pessoal, sistema de compartilhamento comunitário (treinos e desafios), login opcional com Google e finalização do painel administrativo.
  - O feed de atividades interativo foi considerado o item mais complexo e provavelmente não será entregue. Nesse caso, o front-end exibirá a tela com a indicação "em breve", e na apresentação será explicado que se trata de uma funcionalidade *Should have* adiada por falta de tempo.
- **Decisões:**
  - Retirar o feed de atividades interativo do escopo da Sprint caso não haja tempo, deixando-o indicado como "em breve".
  - Dividir as tarefas do front-end:
    - **Mateus Fernandes Dantas:** submissão de desafios no painel, botão de login com Google e inclusão de imagens nos treinos, conforme o protótipo do Figma;
    - **Rafael Souto Lopes Laube:** botão de recorde pessoal e sistema de compartilhamento comunitário.

### 4.4 Inspeção do grupo Torvalds

- **Discussão:** a inspeção está sendo feita em conjunto pelo grupo: Bruno consolida os pontos levantados, as notas e as médias no formulário, e todos os integrantes revisam o documento e conferem as informações no GitHub do grupo inspecionado. O prazo de entrega é 17/11, ao meio-dia.
- **Decisões:** as notas e médias serão consolidadas por Bruno e revisadas por todo o grupo antes da entrega.

### 4.5 Cronograma e apresentação

- **Discussão:**
  - A Sprint 10, a última, não terá funcionalidades novas: de 23/11 a 29/11 a equipe apenas conclui, testa e corrige o que já foi desenvolvido.
  - A apresentação final está prevista para 30/11. Se o prazo ficar apertado, a equipe tentará apresentar em 02/12 com o professor.
  - Na apresentação, Mateus fará a exposição geral, os demais demonstram o aplicativo, Bernardo fala sobre os testes e Bruno sobre a documentação. Não é obrigatório que todos apresentem.
  - A lista de presença da aula do dia foi enviada no Teams.
- **Decisões:** usar a Sprint 10 apenas para estabilização, testes e correções.

## 5. Encaminhamentos (plano de ação)

| Nº | Ação | Responsável | Prazo | Status |
| :-: | :-- | :-- | :-: | :-: |
| 1 | Entregar as métricas do painel administrativo | Equipe de back-end | 17/11/2026 | Pendente |
| 2 | Definir e enviar no grupo o cronograma de entregas do back-end | Equipe de back-end | A definir | Pendente |
| 3 | Implementar o fluxo de código para tornar usuário administrador | Front-end e back-end | Sprint atual | Pendente |
| 4 | Continuar os testes, registrar defeitos e enviar as evidências ao Bruno | Bernardo Campos Caxito Silveira | Contínuo | Pendente |
| 5 | Revisar e fechar as issues já resolvidas no GitHub | Bernardo Campos Caxito Silveira | Sprint atual | Pendente |
| 6 | Finalizar a inspeção do grupo Torvalds | Bruno Cruvinel Barros da Silva | 17/11/2026, 12h | Pendente |
| 7 | Ler a inspeção e conferir os pontos no GitHub do grupo inspecionado | Toda a equipe | 17/11/2026, manhã | Pendente |
| 8 | Preparar os slides da apresentação final | Toda a equipe | Antes de 30/11/2026 | Pendente |
| 9 | Publicar a ata da reunião | Bruno Cruvinel Barros da Silva | 17/11/2026 | Pendente |

## 6. Riscos e impedimentos

- **Feed de atividades interativo:** considerado o item mais complexo da Sprint e com chance de não ser entregue (item 4.3).
- **Prazo da apresentação:** se o prazo ficar apertado, a apresentação final pode passar de 30/11 para 02/12 (item 4.5).

## 7. Próxima reunião

- **Data:** 18/11/2026, às 20h
- **Local:** Discord

---

## 8. Aprovação

Ata redigida por **Bruno Cruvinel Barros da Silva** e revisada pela equipe em 18/11/2026.
