| Versão | Data | Descrição da Alteração | Nome(s) Integrante(s) |
| :----: | :--: | :--------------------: | :-------------------: |
| 1.0 | 27/10/2026 | Criação da ata | Bruno Cruvinel Barros da Silva |

# Ata de Reunião nº 6 — MotivaFit

**Disciplina:** Métodos de Desenvolvimento de Software  
**Projeto:** MotivaFit  
**Equipe:** Grupo Perlman — T03  
**Tipo de reunião:** Interna da equipe  
**Data:** 26/10/2026  
**Horário:** início 19h00 — término 19h45 (aproximado)  
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

1. Revisão dos encaminhamentos anteriores
2. Andamento do desenvolvimento do back-end
3. Datas das entregas e do ponto de controle
4. Documentação do projeto
5. Front-end e protótipo no Figma
6. Testes
7. Encaminhamentos e próxima reunião

## 3. Revisão dos encaminhamentos anteriores

Encaminhamentos da ata nº 5 e itens das atas anteriores ainda em aberto.

| Ação | Responsável | Status |
| :-- | :-- | :-- |
| Definir quem apresentará o documento de visão (14/10) e o documento de arquitetura (19/10) (ata nº 5) | Toda a equipe | Concluída|
| Entregar a atividade sobre métricas mais detalhadas do projeto (ata nº 5; prazo: 14/10/2026) | Toda a equipe | Concluída |
| Apresentar ao grupo o protótipo do front-end (ata nº 5) | Mateus Fernandes Dantas | Concluída (modelo no Figma discutido nesta reunião, ver item 4.5) |
| Concluir a estrutura do banco de dados (ata nº 5) | Luís Felipe Pontes Vieira Andrade | Concluída |
| Apresentar o documento de arquitetura ao professor (ata nº 4; prazo: 19/10/2026) | Toda a equipe | Concluída |
| Atualizar o registro de execução dos testes após cada teste executado (ata nº 3) | Bernardo e desenvolvedores responsáveis por cada funcionalidade | Pendente (os testes ainda não começaram, ver item 4.6) |

## 4. Discussões e decisões

### 4.1 Andamento do desenvolvimento do back-end
- **Discussão:** a reunião teve como foco principal o desenvolvimento do back-end. Os responsáveis pelo back-end apresentaram o relatório "MotivaFit — API para o front-end" (API v1.0.0), que descreve o que já está pronto e como o front-end deve usar cada endpoint.
- **Já está pronto:**
  - cadastro, login, logout e renovação de sessão (refresh), com autenticação por token e cookies de sessão;
  - catálogo de exercícios predefinidos, com consulta para o usuário e administração (criar, alterar e desativar) para perfis administrativos;
  - gerenciamento de treinos (criar, listar, buscar, alterar e excluir), sempre restrito ao usuário logado;
  - perfis de usuário (usuário, administrador e superusuário) e campo de visibilidade do treino (privado ou público).
- **Ainda não existe:** adicionar exercícios a um treino, registrar execução e histórico, ver treinos públicos de outras pessoas e gamificação.
- **Comparação com o planejamento das sprints** (documento de visão):


### 4.2 Datas das entregas e do ponto de controle
- **Discussão:** foram reafirmadas as datas das entregas e a data do ponto de controle.

### 4.3 Documentação do projeto
- **Discussão:** a reunião deu foco também à documentação, em especial à parte de Bruno Cruvinel Barros da Silva, responsável por criar o GitHub Pages em Markdown.
- **Decisão:** Bruno vai iniciar o site de documentação em Markdown com MkDocs.

### 4.4 Situação geral do projeto
- **Discussão:** a equipe avaliou que o projeto não está passando por nenhuma complicação e que todas as etapas estão fluindo bem.

### 4.5 Front-end e protótipo no Figma
- **Discussão:** o front-end apresentou um modelo (protótipo) feito no Figma, que foi bem avaliado pela equipe.
- **Decisão:** o front-end seguirá o modelo do Figma.

### 4.6 Testes
- **Decisão:** Bernardo Campos Caxito Silveira vai começar a elaborar os testes.

## 5. Encaminhamentos (plano de ação)

| Nº | Ação | Responsável |
| :-: | :-- | :-- |
| 1 | Iniciar o site de documentação em Markdown (MkDocs / GitHub Pages) | Bruno Cruvinel Barros da Silva |
| 2 | Iniciar a elaboração dos testes | Bernardo Campos Caxito Silveira |
| 3 | Desenvolver o front-end seguindo o modelo do Figma | Front-end (Rafael Laube e Mateus Fernandes) |
| 4 | Definir a data da próxima reunião |

## 6. Riscos e impedimentos
- Nenhum impedimento registrado nesta reunião. A equipe avaliou que o projeto segue sem complicações.

## 7. Próxima reunião
- **Data:** a definir
- **Local:** Discord
- **Pauta preliminar:** acompanhamento do back-end (exercícios no treino e registro de execução), do front-end (modelo do Figma), do site de documentação e dos testes.

---

## 8. Aprovação
Ata redigida por **Bruno Cruvinel Barros da Silva** e revisada pela equipe em 28/10/2026.
