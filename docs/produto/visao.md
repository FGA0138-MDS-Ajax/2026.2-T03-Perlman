# Visão do Produto e do Projeto (MotivaFit)

**Equipe:** Grupo Perlman - T03  
**Disciplina:** Universidade de Brasília (UnB)  
**Versão:** 1.0.0 (2026)

## Histórico de Revisões
| Data | Versão | Descrição | Autor |
| :--- | :--- | :--- | :--- |
| 22/09/2026 | 0.1.0 | Elaboração inicial do documento | Equipe Perlman |
| 30/09/2026 | 1.0.0 | Revisão conforme apontamentos da síntese | Equipe Perlman |

## Integrantes da Equipe
| Matrícula | Nome | Função | Pontos |
| :--- | :--- | :--- | :--- |
| 232024966 | Bernardo Campos Caxito Silveira | GQM | 14,28 |
| 251039442 | Bruno Cruvinel Barros da Silva | Documentação | 14,29 |
| 252004290 | Lucas Venâncio Pereira | Back-end | 14,28 |
| 252023741 | Luís Felipe Pontes Vieira Andrade | Back-end | 14,28 |
| 251026248 | Mateus Fernandes Dantas* | Front-end | 14,29 |
| 251013651 | Matheus Estevam Ferreira | Back-end | 14,29 |
| 211062428 | Rafael Souto Lopes Laube | Front-end | 14,29 |

---

## 1. Visão Geral do Produto
O MotivaFit é um aplicativo web voltado para praticantes de exercícios físicos que buscam organização e constância. A solução simplifica a montagem de treinos e utiliza a gamificação com sistemas de conquistas e recompensas para engajar o usuário, dando visibilidade à sua evolução e combatendo a desmotivação.

### 1.1 Problema
* **Contexto:** Muitas pessoas desejam praticar exercícios físicos de forma regular, mas enfrentam grandes dificuldades na organização de suas rotinas (como estruturar corretamente a divisão de grupos musculares), no acompanhamento de seu progresso e na manutenção da consistência a longo prazo.
* **Problema encontrado:** A falta de planejamento claro e a ausência de percepção de evolução rápida geram desmotivação e levam ao abandono das atividades.

### 1.2 Declaração de Posição do Produto
O MotivaFit é um aplicativo web de saúde e fitness. A declaração a seguir segue o modelo de posicionamento de Moore. O produto propõe reunir organização de treinos, registro de exercícios, acompanhamento da evolução e conquistas por assiduidade. O web-app é voltado tanto para quem está iniciando sua rotina de treinos, como para quem já está familiarizado com os exercícios, mas gostaria de acompanhar métricas e comparar seu desempenho com seus amigos (semelhante a aplicativos como Strava e GymRats).

| Para | Necessidade | O nome do produto | Que | Ao contrário | Nosso produto |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Praticantes de exercícios fisicos, frequentadores de academia e iniciantes. | Organizar treinos, acompanhar a evolução de cargas e manter a constância diária. | MotivaFit é um aplicativo web de saúde e fitness. | Gamifica a rotina de exercícios e organiza as divisões de treino, oferecendo um acompanhamento prático, recompensas por assiduidade e métricas claras de evolução, além da liberdade para montar seus próprios treinos com foco no seu objetivo. | Planilhas, blocos de notas e aplicativos de registro de treinos, como Hevy, Strong e JEFIT. | Foca na retenção e motivação do usuário por meio de um sistema de conquistas (gamificação) aliado a uma interface intuitiva e simplificada para a gestão dos treinos diários e gestão do progresso. |

### 1.3 Objetivos do Produto
#### 1.3.1 Objetivo Principal
O principal objetivo do produto é apoiar e motivar os usuários na manutenção da regularidade das atividades físicas por meio de gamificação, recompensas visuais, organização simplificada e liberdade para montar os seus treinos, focando em aumentar a percepção de evolução e auxiliar no controle dos treinos executados.

#### 1.3.2 Objetivos Secundários
Além disso, busca facilitar a criação de rotinas de treinos com foco em hipertrofia, permitindo a correta divisão muscular (ex: isolar treino de quadriceps e grupos sinergistas). Fornecer gráficos e estatísticas de frequência e evolução de cargas ao longo do tempo.

#### 1.3.3 Objetivos da Gamificação
Buscando atender todos os usuários do modelo Hexad de gamificação, implementaremos features justificando a cadeia motivação -> mecânica -> requisito:
* **ACHIEVER (motivado por Mastery):** Elemento: Foco absoluto em progressão (PR - Personal Record). O aplicativo fornece gráficos detalhados de evolução para cada elemento do treino do usuário, recompensando a maest