| Versão | Data | Descrição da Alteração | Nome(s) Integrante(s) |
| :----: | :--: | :--------------------: | :-------------------: |
| 1.0 | 18/11/2026 | Criação da ata | Bruno Cruvinel Barros da Silva |

# Ata de Reunião nº 9 — MotivaFit

**Disciplina:** Métodos de Desenvolvimento de Software  
**Projeto:** MotivaFit  
**Equipe:** Grupo Perlman — T03  
**Tipo de reunião:** Interna da equipe  
**Data:** 18/11/2026  
**Horário:** início 20h00 — término 20h15  
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

1. Integração entre front-end e back-end
2. Funcionalidade de desafios e imagens dos exercícios
3. Documentação e testes
4. Deploy da aplicação
5. Prazos da Sprint e inspeção do repositório

## 3. Revisão dos encaminhamentos anteriores

A revisão dos encaminhamentos da ata nº 8 não foi registrada nesta reunião.

## 4. Discussões e decisões

### 4.1 Integração entre front-end e back-end

- **Discussão:**
  - A integração do painel administrativo entre front-end e back-end foi concluída, mas ainda faltam alguns endpoints no Swagger.
  - A parte de back-end do login com Google foi concluída e o botão já existe no front-end; falta integrar os dois.
  - Ainda falta, no front-end, a opção para o usuário aceitar o convite de administrador.

### 4.2 Desafios e exercícios

- **Discussão:**
  - No front-end foram criados os desafios públicos e privados, com participação em desafios públicos e um chat com mensagens e imagens. Por enquanto tudo funciona apenas em *local storage*, sem comunicação com o back-end nem com o banco de dados.
  - **Luís Felipe Pontes Vieira Andrade** vai integrar os desafios ao back-end, sem o chat, até 19/11. O chat exige WebSocket e é mais complexo; como alternativa, avalia-se publicar os resultados dos desafios em postagens.
  - Cada exercício passou a ter uma imagem, e no painel administrativo a imagem é obrigatória ao cadastrar um exercício, com limite de tamanho.
  - Botão de recorde pessoal: a forma atual (a pessoa define a meta no treino) foi considerada adequada. **Mateus Fernandes Dantas** vai estudar melhorias e enviar sugestões pelo WhatsApp para aprovação.
  - Foi apontado um defeito de responsividade observado na apresentação ao professor: ao adicionar exercícios em telas pequenas, o texto fica na vertical. É um problema do front-end e será corrigido.
- **Decisões:**
  - O back-end vai salvar as imagens dos exercícios no banco de dados, e as imagens que hoje estão nos *assets* do código serão migradas para lá.
  - Manter o recorde pessoal no formato atual, salvo se as sugestões de Mateus forem aprovadas.

### 4.3 Documentação e testes

- **Discussão:**
  - **Bruno Cruvinel Barros da Silva** ainda aguarda as evidências de teste do Bernardo e já fez a cobrança; Mateus também vai cobrar.
  - Bruno vai analisar o repositório, atualizar a documentação com as mudanças já feitas e aplicar as correções apontadas pelo grupo que inspecionou o projeto.
- **Decisões:** a equipe autorizou que as alterações na documentação sejam aplicadas diretamente, e as correções apontadas na inspeção recebida devem ser aplicadas antes da inspeção de 19/11.

### 4.4 Deploy

- **Discussão:**
  - Um pré-deploy no Render funcionou, mas o serviço é limitado e cai com cerca de quatro acessos simultâneos.
  - A alternativa preferida é a AWS, com os arquivos do Terraform já prontos; falta uma conta AWS para executar o deploy.
  - Foi criado um e-mail do grupo, que será usado como contato no login com Google.

### 4.5 Prazos e inspeção

- **Discussão:**
  - Gamificação: entrega prevista até 20/11. Parte social (feed): tentativa até 23/11 ou 24/11.
  - O sistema de compartilhamento comunitário aparece no planejamento das Sprints 8 e 9 e corresponde ao feed.
  - O repositório do grupo será inspecionado em 19/11. Na semana seguinte começa a última Sprint e, depois dela, vem a apresentação final.
- **Decisões:** priorizar um projeto estável e funcional: se a parte social não ficar pronta até 23/11 ou 24/11, o feed é cancelado e a equipe foca em publicar o projeto funcionando com as funcionalidades já feitas.

## 5. Encaminhamentos (plano de ação)

| Nº | Ação | Responsável | Prazo | Status |
| :-: | :-- | :-- | :-: | :-: |
| 1 | Criar os endpoints que faltam no Swagger | Equipe de back-end | Sprint atual | Pendente |
| 2 | Integrar o login com Google ao front-end | Mateus Fernandes Dantas | Sprint atual | Pendente |
| 3 | Integrar os desafios ao back-end (sem chat) | Luís Felipe Pontes Vieira Andrade | 19/11/2026 | Pendente |
| 4 | Salvar as imagens dos exercícios no banco | Equipe de back-end | Sprint atual | Pendente |
| 5 | Criar a opção de aceitar o convite de administrador | Front-end | Sprint atual | Pendente |
| 6 | Corrigir o texto na vertical em telas pequenas | Front-end | Sprint atual | Pendente |
| 7 | Enviar sugestões sobre o recorde pessoal | Mateus Fernandes Dantas | A definir | Pendente |
| 8 | Enviar as evidências de teste | Bernardo Campos Caxito Silveira | Imediato | Pendente |
| 9 | Atualizar a documentação e aplicar as correções da inspeção | Bruno Cruvinel Barros da Silva | Antes de 19/11/2026 | Pendente |
| 10 | Criar a conta AWS e fazer o deploy | Toda a equipe | A definir | Pendente |
| 11 | Entregar a gamificação | Toda a equipe | 20/11/2026 | Pendente |
| 12 | Entregar a parte social (feed) | Toda a equipe | 23 ou 24/11/2026 | Pendente |

## 6. Riscos e impedimentos

- **Deploy:** o pré-deploy no Render cai com cerca de quatro acessos simultâneos, e o deploy na AWS depende de uma conta que ainda não existe (item 4.4).
- **Parte social (feed):** pode ser cancelada se não ficar pronta até 23/11 ou 24/11 (item 4.5).
- **Chat dos desafios:** exige WebSocket e é mais complexo; por isso fica fora da integração dos desafios ao back-end (item 4.2).

## 7. Próxima reunião

- **Data:** não definida

---

## 8. Aprovação

Ata redigida por **Bruno Cruvinel Barros da Silva** e revisada pela equipe em 18/11/2026.
