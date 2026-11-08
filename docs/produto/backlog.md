# 4.4 Tabela de backlog do produto

**Abreviações da tabela:** Est.: estimativa preliminar de planejamento do requisito, sem equivalência direta em horas ou contagem formal de PF; US: User Story (história de usuário); ID: identificador. O símbolo "–" indica estimativa ainda não definida.

O backlog identifica cada requisito funcional pelo código RF e o cenário de uso correspondente pelo código CF. Um cenário pode reunir vários requisitos: por exemplo, CF-03 corresponde ao gerenciamento de treinos e está associado a cadastro (RF-03), listagem (RF-04), alteração (RF-05) e exclusão (RF-06). Essa identificação permite relacionar cada funcionalidade ao planejamento e aos testes.

Pontos de função (PF) são uma unidade de medida do tamanho funcional do software, considerando as funcionalidades oferecidas ao usuário, independentemente da linguagem ou tecnologia utilizada [8]. A contagem considera funções de dados e transações, como entradas, saídas e consultas, classificadas conforme sua complexidade. PF não representa diretamente horas de trabalho nem pontos de esforço da Sprint.

O MVP será concluído ao final da Sprint 4 e compreenderá o cadastro e o login com e-mail e senha, o gerenciamento de treinos e o gerenciamento e registro de exercícios. O acesso inicial está dividido em cadastro de usuário com e-mail e senha (RF-01, cenário CF-01) e autenticação com e-mail e senha (RF-02, cenário CF-02), ambos obrigatórios (Must have). O backlog atribui o valor inicial de 1 a cada requisito, totalizando 2 unidades estimadas para cadastro e autenticação. Esses valores são estimativas preliminares de planejamento; a contagem formal em PF depende do detalhamento das funções, dos dados envolvidos e da aplicação das regras de contagem [8]. O desenvolvimento dessas funcionalidades está distribuído entre as Sprints 3 e 4, com a conclusão e validação do conjunto de login, treinos e exercícios na Sprint 4, conforme os casos de teste previstos.

A integração de login com o Google corresponde ao requisito RF-24, associado ao cenário CF-09, com prioridade Could have. Está prevista para as Sprints finais: implementação na Sprint 9 e validação na Sprint 10, conforme a capacidade da equipe. O acesso com e-mail e senha permanece disponível independentemente dessa integração. A estimativa funcional de RF-24 será definida no refinamento do requisito.

**Tabela 12 – Backlog detalhado**

| Requisito                                       | Cenário | Sprint | Prioridade | Est. | Descrição sucinta                                                      | User story associada                                                                                                 |
| :---------------------------------------------- | :------: | :----: | :--------: | :--: | :----------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| **RF-01** Cadastro com e-mail e senha     |  CF-01  |   3   |    Must    |  1  | Criar conta com e-mail e senha.                                          | US-01: Como visitante, quero criar minha conta com e-mail e senha para acessar o aplicativo.                         |
| **RF-02** Login com e-mail e senha        |  CF-02  |   3   |    Must    |  1  | Autenticar com e-mail e senha e rejeitar credenciais inválidas.         | US-02: Como usuário cadastrado, quero entrar com e-mail e senha para acessar meus treinos.                          |
| **RF-03** Cadastro de treino              |  CF-03  |   3   |    Must    |  1  | Cadastrar treino com nome e tipo.                                        | US-03: Como usuário, quero cadastrar meu treino para organizar minha rotina.                                        |
| **RF-04** Listagem de treinos             |  CF-03  |   3   |    Must    |  2  | Listar os treinos do usuário e permitir adicionar treinos já montados. | US-04: Como usuário, quero visualizar meus treinos e adicionar treinos já montados para organizar minhas opções. |
| **RF-05** Alteração de treino           |  CF-03  |   3   |    Must    |  1  | Alterar nome e tipo de treino.                                           | US-05: Como usuário, quero alterar meu treino para adaptar minha rotina.                                            |
| **RF-06** Exclusão de treino             |  CF-03  |   3   |    Must    |  1  | Excluir treino do usuário.                                              | US-06: Como usuário, quero excluir um treino para remover rotinas que não utilizo.                                 |
| **RF-07** Cadastrar exercício no treino  |  CF-04  |   4   |    Must    |  1  | Adicionar exercício predefinido a um treino e definir metas.            | US-07: Como usuário, quero adicionar exercícios e metas ao treino para planejar a sessão.                         |
| **RF-08** Listar exercícios              |  CF-04  |   4   |    Must    |  2  | Listar exercícios e metas de um treino.                                 | US-08: Como usuário, quero consultar exercícios e metas para executar meu treino.                                  |
| **RF-09** Alterar exercício              |  CF-04  |   4   |    Must    |  1  | Editar informações de exercício vinculado a treino.                   | US-09: Como usuário, quero ajustar as metas do exercício para adaptar meu treino.                                  |
| **RF-10** Excluir exercício              |  CF-04  |   4   |    Must    |  1  | Excluir exercício de um treino.                                         | US-10: Como usuário, quero remover um exercício para atualizar minha rotina.                                       |
| **RF-11** Registrar exercício realizado  |  CF-04  |   4   |    Must    |  1  | Registrar execução, carga, repetições, séries e tempo.              | US-11: Como usuário, quero registrar a execução dos exercícios para manter meu histórico.                       |
| **RF-12** Métricas de evolução         |  CF-05  |   5   |    Must    |  2  | Exibir indicadores de desempenho e evolução.                           | US-12: Como usuário, quero acompanhar minhas métricas para perceber minha evolução.                              |
| **RF-13** Convite admin por e-mail        |  CF-07  |   5   |   Could   |  3  | Enviar convite por e-mail para novo administrador.                       | US-13: Como superusuário, quero convidar administradores para delegar a gestão do sistema.                         |
| **RF-14** Usuários ativos (Admin)        |  CF-08  |   5   |   Should   |  3  | Exibir quantidade de usuários ativos nos últimos 30 dias.              | US-14: Como administrador, quero consultar usuários ativos para acompanhar a adesão.                               |
| **RF-15** Frequência média (Admin)      |  CF-08  |   6   |   Should   |  3  | Exibir frequência média de treinos por semana e usuário.              | US-15: Como administrador, quero consultar a frequência média para acompanhar a constância.                       |
| **RF-16** Ranking usuários (Admin)       |  CF-08  |   6   |   Should   |  3  | Exibir os dez usuários com maior tempo de treino nos últimos 30 dias.  | US-16: Como administrador, quero consultar o ranking para acompanhar a atividade dos usuários.                      |
| **RF-17** Exercícios mais feitos (Admin) |  CF-08  |   7   |   Should   |  3  | Exibir os três exercícios mais realizados nos últimos 30 dias.        | US-17: Como administrador, quero consultar exercícios mais realizados para conhecer o uso.                          |
| **RF-18** Submissão de desafios          |  CF-06  |   7   |    Must    |  3  | Criar desafios entre amigos com exercícios, metas e prazo.              | US-18: Como usuário, quero propor desafios para incentivar meu grupo de amigos.                                     |
| **RF-19** Remoção de desafios           |  CF-06  |   7   |    Must    |  1  | Remover desafio criado pelo usuário.                                    | US-19: Como usuário, quero remover meus desafios para manter as propostas atualizadas.                              |
| **RF-20** PR – Recorde pessoal           |  CF-05  |   8   |    Must    |  2  | Acompanhar metas de recordes pessoais no exercício.                     | US-20: Como usuário, quero acompanhar meus recordes pessoais para perceber minha evolução.                        |
| **RF-21** Partilha de resultados          |  CF-06  |   8   |   Should   |  5  | Compartilhar resultados em espaço comunitário público.                | US-21: Como usuário, quero compartilhar meus resultados para motivar a comunidade.                                  |
| **RF-22** Conquistas (streak)             |  CF-06  |   9   |    Must    |  2  | Exibir conquistas de assiduidade no perfil.                              | US-22: Como usuário, quero visualizar minhas conquistas para reconhecer minha constância.                          |
| **RF-23** Feed interativo                 |  CF-06  |   9   |   Should   |  4  | Permitir grupos por convite e interação com resultados diários.       | US-23: Como usuário, quero curtir e comentar resultados do meu grupo para incentivar meus amigos.                   |
| **RF-24** Login com Google                |  CF-09  | 9, 10 |   Could   |  –  | Oferecer autenticação opcional com Google após o MVP.                 | US-24: Como usuário, quero entrar com Google como alternativa para facilitar meu acesso.                            |

*Fonte: elaborado pelos autores (2026). Todos os requisitos são do tipo funcional.*

## 4.4.1 Descrição dos requisitos

Todos os requisitos abaixo são do tipo funcional. Os identificadores RF correspondem aos cenários CF apresentados na tabela de backlog.

- **RF-01** — Permitir ao usuário não autenticado criar sua conta no sistema informando e-mail e senha. Requisito obrigatório para o MVP, associado ao cenário CF-01.
- **RF-02** — Permitir ao usuário cadastrado acessar o sistema com e-mail e senha válidos e impedir o acesso com credenciais inválidas. Requisito obrigatório para o MVP, associado ao cenário CF-02.
- **RF-03** — O usuário adiciona o seu novo treino, definindo o nome e tipo de treino (musculação ou aeróbico).
- **RF-04** — O usuário irá visualizar o catálogo de treinos dele, permitindo também adicionar treinos já montados (basta o usuário adicionar na sua lista).
- **RF-05** — Permite ao usuário fazer alteração no treino (nome e tipo de treino: musculação ou aeróbico).
- **RF-06** — Permite ao usuário remover um treino da sua lista de treinos.
- **RF-07** — Permite ao usuário cadastrar um novo exercício dentro de um treino, definindo a meta de tempo, repetições e/ou carga deste exercício, além do pace para corrida. Essas metas ficam em um campo de texto, onde o usuário digita a meta. Esse exercício já está predefinido na tabela de exercícios, de forma que o usuário não consegue criar o seu exercício.
- **RF-08** — Listar os exercícios de um treino (exibir o nome do exercício e suas metas).
- **RF-09** — Permite ao usuário a edição e atualização das informações de um exercício já cadastrado em um treino.
- **RF-10** — Permite ao usuário remover um exercício da sua lista de exercícios de um treino.
- **RF-11** — Permite ao usuário registrar a execução de um exercício em seu treino, registrando meta de carga, de repetições, de séries e tempo de execução.
- **RF-12** — O usuário pode visualizar indicadores de desempenho e evolução física ao longo do tempo.
- **RF-13** — Permite ao superusuário enviar um convite de novo administrador pelo e-mail do novo administrador.
- **RF-14** — Exibe a quantidade de usuários ativos nos últimos 30 dias.
- **RF-15** — Exibe a frequência média de treinos/semana/usuário.
- **RF-16** — No painel do administrador, exibe o ranking dos usuários ativos nos últimos 30 dias, listados por maior tempo de treino (top 10).
- **RF-17** — No painel do administrador, exibe os 3 exercícios mais realizados pelos usuários nos últimos 30 dias.
- **RF-18** — No painel do usuário, criar uma lista de exercícios entre amigos para realizarem dentro de um prazo de tempo. Definindo, para cada exercício, metas de carga, repetições, séries ou tempo de exercício.
- **RF-19** — Permite ao usuário remover um desafio criado.
- **RF-20** — Opção para a criação de um acompanhamento sobre a evolução do usuário em suas metas de recordes pessoais (campo de texto no exercício).
- **RF-21** — Local público para compartilhar os resultados dos usuários para fazer com que eles continuem se motivando.
- **RF-22** — Conquistas visuais no perfil de cada usuário para que eles possam mostrar o seu empenho nos seus treinos.
- **RF-23** — Criação de pequenos grupos de treino onde os membros podem curtir, comentar e celebrar os resultados diários uns dos outros, fortalecendo as relações (entrada por meio de convite).
- **RF-24** — Integrar a autenticação com o Google como alternativa ao login com e-mail e senha. Requisito Could have, associado ao cenário CF-09, previsto para implementação e validação nas Sprints 9 e 10 conforme a capacidade da equipe, após a entrega do MVP. A integração não substitui o acesso com e-mail e senha.

---

*As fontes citadas entre colchetes estão em [Referências](../referencias.md).*
