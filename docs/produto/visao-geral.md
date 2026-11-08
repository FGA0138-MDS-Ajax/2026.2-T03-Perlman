# 1 Visão geral do produto

O MotivaFit é um aplicativo web voltado para praticantes de exercícios físicos que buscam organização e constância. A solução simplifica a montagem de treinos e utiliza a gamificação, com sistemas de conquistas e recompensas, para engajar o usuário, dando visibilidade à sua evolução e combatendo a desmotivação.

## 1.1 Problema

- **Contexto:** muitas pessoas desejam praticar exercícios físicos de forma regular, mas enfrentam grandes dificuldades na organização de suas rotinas (como estruturar corretamente a divisão de grupos musculares), no acompanhamento de seu progresso e na manutenção da consistência a longo prazo.
- **Problema encontrado:** a falta de planejamento claro e a ausência de percepção de evolução rápida geram desmotivação e levam ao abandono das atividades.

## 1.2 Declaração de posição do produto

O MotivaFit é um aplicativo web de saúde e fitness. A declaração a seguir segue o modelo de posicionamento de Moore [1]. O produto propõe reunir organização de treinos, registro de exercícios, acompanhamento da evolução e conquistas por assiduidade.

A análise de concorrência considera aplicativos de registro de treinos: o Hevy oferece acompanhamento do progresso [9]; o Strong oferece registro de treinos [10]; o JEFIT oferece registro de exercícios e sessões de treino [11]. Esses aplicativos atendem necessidades próximas às do MotivaFit. A combinação de organização, motivação e interação social é a proposta do projeto, sem pressupor exclusividade dessas funcionalidades no mercado.

O web app é voltado tanto para quem está iniciando sua rotina de treinos quanto para quem já está familiarizado com os exercícios, mas gostaria de acompanhar métricas e comparar seu desempenho com seus amigos (semelhante a aplicativos como Strava e GymRats).

**Tabela 3 – Declaração de posição do produto**

| Campo                       | Declaração                                                                                                                                                                                                                                             |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Para**              | Praticantes de exercícios físicos, frequentadores de academia e iniciantes.                                                                                                                                                                            |
| **Necessidade**       | Organizar treinos, acompanhar a evolução de cargas e manter a constância diária.                                                                                                                                                                     |
| **O nome do produto** | MotivaFit é um aplicativo web de saúde e fitness.                                                                                                                                                                                                      |
| **Que**               | Gamifica a rotina de exercícios e organiza as divisões de treino, oferecendo um acompanhamento prático, recompensas por assiduidade e métricas claras de evolução, além da liberdade para montar seus próprios treinos com foco no seu objetivo. |
| **Ao contrário**     | Planilhas, blocos de notas e aplicativos de registro de treinos, como Hevy, Strong e JEFIT [9–11].                                                                                                                                                      |
| **Nosso produto**     | Foca na retenção e motivação do usuário por meio de um sistema de conquistas (gamificação) aliado a uma interface intuitiva e simplificada para a gestão dos treinos diários e do progresso.                                                    |

*Fonte: elaborado pelos autores (2026).*

## 1.3 Objetivos do produto

### 1.3.1 Objetivo principal

Apoiar e motivar os usuários na manutenção da regularidade das atividades físicas por meio de gamificação, recompensas visuais, organização simplificada e liberdade para montar os seus treinos, focando em aumentar a percepção de evolução e auxiliar no controle dos treinos executados.

### 1.3.2 Objetivos secundários

- Facilitar a criação de rotinas de treinos com foco em hipertrofia, permitindo a correta divisão muscular (por exemplo, isolar o treino de quadríceps e grupos sinergistas).
- Fornecer gráficos e estatísticas de frequência e evolução de cargas ao longo do tempo.

### 1.3.3 Objetivos da gamificação

Buscando atender todos os usuários do modelo Hexad de gamificação [2, 3], serão implementadas funcionalidades justificando a cadeia **motivação → mecânica → requisito**:

- **ACHIEVER (motivado por Mastery)**
  - *Elemento:* foco absoluto em progressão (PR – Personal Record). O aplicativo fornece gráficos detalhados de evolução para cada elemento do treino do usuário, recompensando a maestria na execução técnica e a superação contínua de limites.
  - *Rastreabilidade:* RF-12 e RF-20; testes planejados T9 e T19.
- **PHILANTHROPIST (motivado por Purpose)**
  - *Elemento:* sistema de compartilhamento comunitário. Usuários podem compartilhar seus resultados em um espaço público para apoiar a motivação dos demais, conforme RF-21.
  - *Rastreabilidade:* RF-21; sem teste planejado no MVP (Minimum Viable Product, produto mínimo viável).
- **FREE SPIRIT (motivado por Autonomy)**
  - *Elemento:* personalização da rotina. O usuário pode criar e alterar seus treinos e selecionar exercícios predefinidos para compor a rotina e ajustar suas metas. A autonomia é atendida pelas operações existentes de gerenciamento de treinos e exercícios; não há um modo separado de Treino Livre ou um requisito de catálogo exploratório no escopo.
  - *Rastreabilidade:* RF-03, RF-05, RF-07 e RF-09; testes planejados T4, T6, T15 e T17.
- **PLAYER (motivado por Reward)**
  - *Elemento:* programa de recompensas diretas. A assiduidade nos treinos libera conquistas visuais no perfil, conforme os critérios definidos para RF-22.
  - *Rastreabilidade:* RF-22; teste planejado T10.
- **SOCIALISER (motivado por Relatedness)**
  - *Elemento:* feed de atividades interativo. O aplicativo permite a criação de pequenos grupos de treino onde os membros podem curtir, comentar e celebrar os resultados diários uns dos outros, fortalecendo as relações.
  - *Rastreabilidade:* RF-23; sem teste planejado no MVP.
- **DISRUPTOR (motivado por Change)**
  - *Elemento:* submissão de desafios. Espaço para que esses usuários criem desafios fora do padrão (como "Desafio de 100 repetições") para testar os limites de cada um, além de ter um grupo próprio para as pessoas colocarem seus resultados desses desafios.
  - *Rastreabilidade:* RF-18; sem teste planejado no MVP.

## 1.4 Tecnologias a serem utilizadas

**Tabela 4 – Tecnologias utilizadas**

| Tecnologia              | Requisito / Motivação                                                       | Alternativa considerada | Custo aceito                                                                                            |
| :---------------------- | :---------------------------------------------------------------------------- | :---------------------- | :------------------------------------------------------------------------------------------------------ |
| Java / Spring Boot      | Robustez para regras de negócio (back-end).                                  | Node.js / Express       | Maior verbosidade em troca de tipagem forte.                                                            |
| React                   | Criação de interface web interativa (front-end).                            | Vue.js                  | Curva de aprendizado da equipe em troca de ecossistema.                                                 |
| PostgreSQL              | Estruturação relacional de treinos e usuários.                             | MongoDB                 | Rigidez do schema em troca de integridade ACID (atomicidade, consistência, isolamento e durabilidade). |
| Docker / GitHub Actions | Automação da esteira de CI/CD (integração contínua e entrega contínua). | Implantação manual    | Tempo de configuração em troca de confiabilidade.                                                     |
| Git / GitHub            | Versionamento colaborativo.                                                   | GitLab                  | Padrão de mercado adotado pela equipe.                                                                 |

*Fonte: elaborado pelos autores (2026).*

- **Ambiente e infraestrutura:** suporte contínuo a ambientes operacionais baseados em Linux e implantação via containers Docker.
- **Gerenciamento do projeto:** reuniões realizadas pelo Discord/Teams e grupo no WhatsApp.

---

*As fontes citadas entre colchetes estão em [Referências](../referencias.md).*
