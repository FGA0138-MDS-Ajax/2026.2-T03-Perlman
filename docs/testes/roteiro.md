# 6.2 Roteiro de teste

Os códigos T identificam os casos de teste.

O roteiro documenta os cenários de validação planejados (Test Plan). O resultado obtido, a referência da evidência, os reparos e o número de ciclos devem ser atualizados no registro de execução após cada teste. Evidências externas devem ser identificadas por caminho ou URL (Uniform Resource Locator, endereço de um recurso), versão do código e data. Casos apenas planejados não garantem ausência de defeitos, mas estabelecem o critério de sucesso.

O roteiro é organizado em duas tabelas vinculadas pelo ID: planejamento (tipo, nível, pré-condições e resultado previsto) e execução (resultado obtido, evidência, reparos e ciclos). O detalhamento apresenta o objetivo e, nos novos casos, os procedimentos. T2 e T3 validam e-mail e senha do MVP; não testam a senha do Google. O consentimento cancelado é tratado em T13, tokens inválidos ou expirados em T21 e acesso sem sessão em T22.

Os casos T1 a T8, T14 a T18 e T22 devem ser executados nas Sprints 3 e 4; T20 valida o conjunto do MVP na Sprint 4. T9 será executado na Sprint 5, T19 na Sprint 8 e T10 na Sprint 9. T11 acompanha a entrega das funcionalidades administrativas. T12, T13 e T21 dependem da implementação de RF-24 nas Sprints 9 e 10. Os casos funcionais ainda não detalhados de RF-13 a RF-19, RF-21 e RF-23 deverão ser definidos antes da Sprint de implementação de cada requisito, com atualização da matriz. O teste de acesso T11 não substitui os testes funcionais do painel administrativo.

**Tabela 19 – Planejamento dos testes**

| ID / nome                                               | Tipo                         | Nível       | Pré-condições                                                                                                                                                                             | Resultado previsto                                                                                                                                                                         |
| :------------------------------------------------------ | :--------------------------- | :----------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **T1** Cadastro de usuário com e-mail e senha    | Funcional                    | Integração | Usuário ainda não cadastrado; acesso à tela de cadastro; e-mail e senha válidos para o cadastro                                                                                          | A conta e o perfil do usuário são criados. O usuário pode acessar a tela de login para se autenticar com o e-mail e a senha cadastrados                                                 |
| **T2** Login com credencial válida               | Funcional                    | Sistema      | Usuário previamente cadastrado; e-mail e senha válidos                                                                                                                                     | O sistema autentica o usuário e exibe a tela principal correspondente ao perfil                                                                                                           |
| **T3** Login com dados inválidos                 | Funcional / Segurança       | Sistema      | Usuário cadastrado; senha ou e-mail incorreto                                                                                                                                               | O sistema nega o acesso e apresenta uma mensagem clara, sem revelar informação sensível                                                                                                 |
| **T4** Cadastro de treino personalizado           | Funcional                    | Integração | Usuário autenticado; acesso ao formulário de treino; nome e tipo válidos                                                                                                                  | O treino é validado, salvo no banco de dados e exibido na lista de treinos do usuário                                                                                                    |
| **T5** Validação de treino incompleto           | Funcional / Validação      | Integração | Usuário autenticado; acesso à tela de criação de treino                                                                                                                                  | O sistema impede o salvamento e informa quais campos precisam ser preenchidos. Nenhum registro incompleto é criado                                                                        |
| **T6** Alteração de treino existente            | Funcional                    | Integração | Usuário autenticado; existência de um treino salvo                                                                                                                                         | As alterações são salvas e aparecem corretamente na visualização do treino                                                                                                            |
| **T7** Exclusão de treino                        | Funcional                    | Sistema      | Usuário autenticado; existência de treino salvo                                                                                                                                            | O sistema solicita confirmação, exclui o treino após a confirmação e remove o item da listagem. Se o usuário cancelar, o treino permanece salvo                                      |
| **T8** Registro de exercício realizado           | Funcional                    | Integração | Usuário autenticado; existência de treino cadastrado                                                                                                                                       | O exercício é marcado como realizado, o histórico é atualizado e as informações são persistidas pelo banco de dados                                                                 |
| **T9** Atualização de métricas de evolução   | Funcional                    | Sistema      | Usuário autenticado; existência de exercícios realizados com datas e cargas registradas                                                                                                   | Os gráficos e indicadores apresentam os dados correspondentes aos exercícios realizados                                                                                                  |
| **T10** Pontuação e conquista por assiduidade   | Funcional / Gamificação    | Integração | Usuário autenticado; critérios de conquista definidos; registros de assiduidade preparados                                                                                                 | O sistema exibe a conquista no perfil somente quando os critérios de assiduidade são atingidos                                                                                           |
| **T11** Restrição do painel de admin            | Não funcional / Segurança  | Integração | Existência de um usuário comum e um usuário administrador                                                                                                                                 | O usuário comum não consegue acessar o painel administrativo. O administrador consegue acessá-lo normalmente                                                                            |
| **T12** Login com Google                          | Funcional / Autenticação   | Integração | Integração com o Google implementada e configurada; conta Google válida; serviço de autenticação disponível                                                                           | Após autorização e validação da autenticação com o Google, o usuário acessa o sistema com seu perfil. O login com e-mail e senha permanece disponível                             |
| **T13** Falha ou cancelamento no login com Google | Funcional / Segurança       | Integração | Integração com o Google implementada; falha de autenticação, indisponibilidade do serviço ou cancelamento pelo usuário; conta local válida para verificar o acesso com e-mail e senha | O sistema não autentica o usuário pelo Google, informa a falha ou cancelamento e mantém disponível o acesso com e-mail e senha. Credenciais locais válidas permitem acessar o sistema |
| **T14** Listagem de treinos                       | Funcional                    | Sistema      | Usuário autenticado; treinos próprios e de outro usuário cadastrados                                                                                                                      | Exibir os treinos próprios e permitir adicionar um treino já montado; não expor treinos privados de outro usuário                                                                      |
| **T15** Cadastro de exercício no treino          | Funcional                    | Integração | Usuário autenticado; treino próprio cadastrado; exercício predefinido disponível                                                                                                         | Exercício válido vinculado ao treino com a meta informada; dados obrigatórios ausentes impedem o cadastro                                                                               |
| **T16** Listagem de exercícios                   | Funcional                    | Sistema      | Usuário autenticado; treino com exercícios e treino sem exercícios                                                                                                                        | Exibir os nomes e metas corretos de cada treino; apresentar estado vazio quando não houver exercícios                                                                                    |
| **T17** Alteração de exercício                 | Funcional                    | Integração | Usuário autenticado; exercício vinculado a treino próprio                                                                                                                                 | Informações alteradas persistidas e exibidas; demais exercícios mantidos                                                                                                                |
| **T18** Exclusão de exercício                   | Funcional                    | Sistema      | Usuário autenticado; treino próprio com dois exercícios                                                                                                                                   | Exercício removido da lista do treino; outro exercício mantido                                                                                                                           |
| **T19** Recorde pessoal                           | Funcional                    | Sistema      | Usuário autenticado; funcionalidade de PR implementada; exercício com meta de recorde pessoal                                                                                              | Meta e acompanhamento de recorde pessoal persistidos e exibidos corretamente, sem alterar registros de outros exercícios                                                                  |
| **T20** Usabilidade do MVP                        | Não funcional / Usabilidade | Sistema      | MVP disponível; conta de teste; navegador em telas móvel e desktop                                                                                                                         | Fluxos concluídos sem bloqueios de navegação, campos ou botões inacessíveis, texto ilegível ou sobreposição; mensagens orientam a correção de entradas inválidas                |
| **T21** Token Google inválido ou expirado        | Funcional / Segurança       | Integração | RF-24 implementado; resposta de autenticação simulável com token inválido e expirado                                                                                                     | Tokens rejeitados sem criação de sessão; acesso protegido negado; login local permanece disponível                                                                                     |
| **T22** Rota protegida sem sessão                | Funcional / Segurança       | Integração | Aplicação disponível; nenhuma sessão autenticada                                                                                                                                         | Acesso negado sem exposição de dados; interface encaminha ao login e API retorna resposta de não autorização                                                                          |

*Fonte: elaborado pelos autores (2026).*

**Tabela 20 – Registro de execução dos testes**

| ID | Resultado obtido | Evidência       | Reparos          | Ciclos |
| :-: | :--------------- | :--------------- | :--------------- | :----: |
| T1 | Não executado   | Não disponível | Não registrados |   0   |
| T2 | Não executado   | Não disponível | Não registrados |   0   |
| T3 | Não executado   | Não disponível | Não registrados |   0   |
| T4 | Não executado   | Não disponível | Não registrados |   0   |
| T5 | Não executado   | Não disponível | Não registrados |   0   |
| T6 | Não executado   | Não disponível | Não registrados |   0   |
| T7 | Não executado   | Não disponível | Não registrados |   0   |
| T8 | Não executado   | Não disponível | Não registrados |   0   |
| T9 | Não executado   | Não disponível | Não registrados |   0   |
| T10 | Não executado   | Não disponível | Não registrados |   0   |
| T11 | Não executado   | Não disponível | Não registrados |   0   |
| T12 | Não executado   | Não disponível | Não registrados |   0   |
| T13 | Não executado   | Não disponível | Não registrados |   0   |
| T14 | Não executado   | Não disponível | Não registrados |   0   |
| T15 | Não executado   | Não disponível | Não registrados |   0   |
| T16 | Não executado   | Não disponível | Não registrados |   0   |
| T17 | Não executado   | Não disponível | Não registrados |   0   |
| T18 | Não executado   | Não disponível | Não registrados |   0   |
| T19 | Não executado   | Não disponível | Não registrados |   0   |
| T20 | Não executado   | Não disponível | Não registrados |   0   |
| T21 | Não executado   | Não disponível | Não registrados |   0   |
| T22 | Não executado   | Não disponível | Não registrados |   0   |

*Fonte: elaborado pelos autores (2026).*

## 6.2.1 Detalhamento dos casos de teste

### T1 – Cadastro de usuário com e-mail e senha

- **Objetivo do teste:** verificar se um novo usuário consegue criar uma conta informando e-mail e senha (RF-01, CF-01).
- **Nível:** integração · **Tipo:** funcional
- **Pré-condições:** usuário ainda não cadastrado; acesso à tela de cadastro; e-mail e senha válidos para o cadastro.
- **Procedimento:** preencher e-mail e senha válidos, enviar o cadastro e verificar a conta criada; repetir com e-mail já cadastrado e dados obrigatórios ausentes.
- **Resultado esperado:** a conta e o perfil do usuário são criados. O usuário pode acessar a tela de login para se autenticar com o e-mail e a senha cadastrados.
- **Resultado da execução e correções:** não executado. Após a execução, registrar se foi aprovado, reprovado ou bloqueado. Se houver falha, informar a correção realizada e o número da execução.

### T2 – Login com credencial válida

- **Objetivo do teste:** verificar se um usuário cadastrado consegue acessar o sistema com e-mail e senha válidos (RF-02, CF-02).
- **Nível:** sistema · **Tipo:** funcional
- **Pré-condições:** usuário previamente cadastrado; e-mail e senha válidos.
- **Procedimento:** informar e-mail e senha corretos, confirmar o login e acessar a tela principal.
- **Resultado esperado:** o sistema autentica o usuário e exibe a tela principal correspondente ao perfil.
- **Resultado da execução e correções:** não executado. Registrar o resultado real e eventuais correções.

### T3 – Login com dados inválidos

- **Objetivo do teste:** verificar se o sistema impede o acesso quando o usuário informa e-mail ou senha incorretos (RF-02, CF-02).
- **Nível:** sistema · **Tipo:** funcional / segurança
- **Pré-condições:** usuário cadastrado; senha ou e-mail incorreto.
- **Procedimento:** informar senha incorreta e depois e-mail não cadastrado; tentar acessar uma rota protegida após cada tentativa.
- **Resultado esperado:** o sistema nega o acesso e apresenta uma mensagem clara, sem revelar informação sensível.
- **Resultado da execução e correções:** não executado. Registrar se o bloqueio ocorreu corretamente. Corrigir mensagens ou regras de autenticação caso necessário.

### T4 – Cadastro de treino personalizado

- **Objetivo do teste:** verificar o cadastro de treino com nome e tipo (RF-03, CF-03). A inclusão de exercícios e metas é validada em T15.
- **Nível:** integração · **Tipo:** funcional
- **Pré-condições:** usuário autenticado; acesso ao formulário de treino; nome e tipo válidos.
- **Procedimento:** informar nome e tipo de treino, salvar e conferir os dados na lista do usuário.
- **Resultado esperado:** o treino é validado, salvo no banco de dados e exibido na lista de treinos do usuário.
- **Resultado da execução e correções:** não executado. Caso o treino não seja salvo ou apresente dados incorretos, registrar o defeito e a correção aplicada.

### T5 – Validação de treino incompleto

- **Objetivo do teste:** verificar se o sistema impede o cadastro de um treino sem informações obrigatórias.
- **Nível:** integração · **Tipo:** funcional / validação
- **Pré-condições:** usuário autenticado; acesso à tela de criação de treino.
- **Procedimento:** deixar nome ou tipo obrigatório vazio, tentar salvar e verificar a mensagem e a ausência de persistência.
- **Resultado esperado:** o sistema impede o salvamento e informa quais campos precisam ser preenchidos. Nenhum registro incompleto é criado.
- **Resultado da execução e correções:** não executado. Registrar o resultado e corrigir validações ausentes, se necessário.

### T6 – Alteração de treino existente

- **Objetivo do teste:** verificar se o usuário consegue alterar as informações de um treino já cadastrado.
- **Nível:** integração · **Tipo:** funcional
- **Pré-condições:** usuário autenticado; existência de um treino salvo.
- **Procedimento:** editar nome e tipo do treino, salvar e recarregar a visualização.
- **Resultado esperado:** as alterações são salvas e aparecem corretamente na visualização do treino.
- **Resultado da execução e correções:** não executado. Registrar o resultado e eventuais correções na tela ou na API.

### T7 – Exclusão de treino

- **Objetivo do teste:** verificar se o usuário consegue excluir um treino já cadastrado.
- **Nível:** sistema · **Tipo:** funcional
- **Pré-condições:** usuário autenticado; existência de treino salvo.
- **Procedimento:** cancelar uma exclusão e verificar a permanência do treino; repetir confirmando a exclusão e consultar a lista.
- **Resultado esperado:** o sistema solicita confirmação, exclui o treino após a confirmação e remove o item da listagem. Se o usuário cancelar, o treino permanece salvo.
- **Resultado da execução e correções:** não executado. Registrar se a confirmação e a exclusão funcionaram corretamente.

### T8 – Registro de exercício realizado

- **Objetivo do teste:** verificar o registro da execução de um exercício, com carga, repetições, séries e tempo (RF-11, CF-04).
- **Nível:** integração · **Tipo:** funcional
- **Pré-condições:** usuário autenticado; existência de treino cadastrado.
- **Procedimento:** registrar a execução do exercício com os valores de carga, repetições, séries e tempo; recarregar o histórico e comparar os valores.
- **Resultado esperado:** o exercício é marcado como realizado, o histórico é atualizado e as informações são persistidas pelo banco de dados.
- **Resultado da execução e correções:** não executado. Registrar o resultado e corrigir problemas de persistência ou duplicidade, caso encontrados.

### T9 – Atualização de métricas de evolução

- **Objetivo do teste:** verificar se o registro de exercícios atualiza corretamente a frequência, cargas e demais estatísticas.
- **Nível:** sistema · **Tipo:** funcional
- **Pré-condições:** usuário autenticado; existência de exercícios realizados com datas e cargas registradas.
- **Procedimento:** inserir registros com datas e cargas conhecidas, consultar as métricas e comparar os indicadores com os registros de origem.
- **Resultado esperado:** os gráficos e indicadores apresentam os dados correspondentes aos exercícios realizados.
- **Resultado da execução e correções:** não executado. Comparar os dados exibidos com os dados armazenados e registrar eventuais correções.

### T10 – Pontuação e conquista por assiduidade

- **Objetivo do teste:** verificar se o sistema libera conquistas por assiduidade de acordo com os critérios definidos para RF-22.
- **Nível:** integração · **Tipo:** funcional / gamificação
- **Pré-condições:** usuário autenticado; critérios de conquista definidos; registros de assiduidade preparados.
- **Procedimento:** preparar registros que atendam e que não atendam aos critérios de conquista definidos para RF-22; processar a assiduidade e conferir o perfil.
- **Resultado esperado:** o sistema exibe a conquista no perfil somente quando os critérios de assiduidade são atingidos.
- **Resultado da execução e correções:** não executado. Conferir os cálculos e registrar correções em caso de pontuação incorreta.

### T11 – Restrição do painel de admin

- **Objetivo do teste:** verificar se somente os usuários autorizados conseguem acessar funcionalidades administrativas.
- **Nível:** integração · **Tipo:** não funcional / segurança / autorização
- **Pré-condições:** existência de um usuário comum e um usuário administrador.
- **Procedimento:** tentar acessar painel e rotas administrativas com usuário comum; repetir com administrador autorizado.
- **Resultado esperado:** o usuário comum não consegue acessar o painel administrativo. O administrador consegue acessá-lo normalmente.
- **Resultado da execução e correções:** não executado. Registrar o resultado e corrigir permissões ou validações de acesso, caso necessário.

### T12 – Login com Google

- **Objetivo do teste:** verificar a autenticação opcional com o Google (RF-24, CF-09), após a implementação prevista nas Sprints finais.
- **Nível:** integração · **Tipo:** funcional / autenticação
- **Pré-condições:** integração com o Google implementada e configurada; conta Google válida; serviço de autenticação disponível.
- **Procedimento:** iniciar o login pelo Google, autorizar o consentimento e conferir o acesso; verificar que o login local continua disponível.
- **Resultado esperado:** após autorização e validação da autenticação com o Google, o usuário acessa o sistema com seu perfil. O login com e-mail e senha permanece disponível.
- **Resultado da execução e correções:** não executado. Execução prevista nas Sprints finais, caso RF-24 seja implementado. Registrar resultado observado, correções e reexecuções.

### T13 – Falha ou cancelamento no login com Google

- **Objetivo do teste:** verificar que falhas ou cancelamento na autenticação com o Google não liberam acesso e não impedem o uso do login com e-mail e senha (RF-24, CF-09).
- **Nível:** integração · **Tipo:** funcional / segurança
- **Pré-condições:** integração com o Google implementada; falha de autenticação, indisponibilidade do serviço ou cancelamento pelo usuário; conta local válida para verificar o acesso com e-mail e senha.
- **Procedimento:** iniciar o login pelo Google, cancelar o consentimento e conferir a ausência de sessão; simular indisponibilidade do provedor e verificar o login local.
- **Resultado esperado:** o sistema não autentica o usuário pelo Google, informa a falha ou cancelamento e mantém disponível o acesso com e-mail e senha. Credenciais locais válidas permitem acessar o sistema.
- **Resultado da execução e correções:** não executado. Execução prevista nas Sprints finais, caso RF-24 seja implementado. Registrar resultado observado, correções e reexecuções.

### T14 – Listagem de treinos

- **Objetivo do teste:** validar a listagem de treinos (RF-04, CF-03).
- **Nível:** sistema · **Tipo:** funcional
- **Pré-condições:** usuário autenticado; treinos próprios e de outro usuário cadastrados.
- **Procedimento:** abrir a lista de treinos; comparar com os registros do usuário; selecionar um treino já montado e adicioná-lo à lista.
- **Resultado esperado:** exibir os treinos próprios e permitir adicionar um treino já montado; não expor treinos privados de outro usuário.
- **Resultado da execução e correções:** não executado; evidência não disponível; reparos não registrados; zero ciclos executados.

### T15 – Cadastro de exercício no treino

- **Objetivo do teste:** validar o cadastro de exercício no treino (RF-07, CF-04).
- **Nível:** integração · **Tipo:** funcional
- **Pré-condições:** usuário autenticado; treino próprio cadastrado; exercício predefinido disponível.
- **Procedimento:** selecionar o exercício, informar a meta e salvar; repetir sem exercício ou meta obrigatória.
- **Resultado esperado:** exercício válido vinculado ao treino com a meta informada; dados obrigatórios ausentes impedem o cadastro.
- **Resultado da execução e correções:** não executado; evidência não disponível; reparos não registrados; zero ciclos executados.

### T16 – Listagem de exercícios

- **Objetivo do teste:** validar a listagem de exercícios (RF-08, CF-04).
- **Nível:** sistema · **Tipo:** funcional
- **Pré-condições:** usuário autenticado; treino com exercícios e treino sem exercícios.
- **Procedimento:** abrir os dois treinos e conferir os exercícios exibidos.
- **Resultado esperado:** exibir os nomes e metas corretos de cada treino; apresentar estado vazio quando não houver exercícios.
- **Resultado da execução e correções:** não executado; evidência não disponível; reparos não registrados; zero ciclos executados.

### T17 – Alteração de exercício

- **Objetivo do teste:** validar a alteração de exercício (RF-09, CF-04).
- **Nível:** integração · **Tipo:** funcional
- **Pré-condições:** usuário autenticado; exercício vinculado a treino próprio.
- **Procedimento:** alterar as metas, salvar e recarregar a tela.
- **Resultado esperado:** informações alteradas persistidas e exibidas; demais exercícios mantidos.
- **Resultado da execução e correções:** não executado; evidência não disponível; reparos não registrados; zero ciclos executados.

### T18 – Exclusão de exercício

- **Objetivo do teste:** validar a exclusão de exercício (RF-10, CF-04).
- **Nível:** sistema · **Tipo:** funcional
- **Pré-condições:** usuário autenticado; treino próprio com dois exercícios.
- **Procedimento:** remover um exercício e recarregar a lista.
- **Resultado esperado:** exercício removido da lista do treino; outro exercício mantido.
- **Resultado da execução e correções:** não executado; evidência não disponível; reparos não registrados; zero ciclos executados.

### T19 – Acompanhamento de recorde pessoal

- **Objetivo do teste:** validar o acompanhamento de recorde pessoal (RF-20, CF-05).
- **Nível:** sistema · **Tipo:** funcional
- **Pré-condições:** usuário autenticado; funcionalidade de PR implementada; exercício com meta de recorde pessoal.
- **Procedimento:** cadastrar a meta de recorde pessoal no campo do exercício, salvar, consultar e atualizar o acompanhamento.
- **Resultado esperado:** meta e acompanhamento de recorde pessoal persistidos e exibidos corretamente, sem alterar registros de outros exercícios.
- **Resultado da execução e correções:** não executado; evidência não disponível; reparos não registrados; zero ciclos executados.

### T20 – Usabilidade do MVP

- **Objetivo do teste:** validar a usabilidade do MVP (RF-01 a RF-11).
- **Nível:** sistema · **Tipo:** não funcional / usabilidade
- **Pré-condições:** MVP disponível; conta de teste; navegador em telas móvel e desktop.
- **Procedimento:** executar cadastro, login, criação de treino, inclusão de exercício e registro de execução; verificar navegação por teclado, legibilidade, mensagens e adaptação da tela.
- **Resultado esperado:** fluxos concluídos sem bloqueios de navegação, campos ou botões inacessíveis, texto ilegível ou sobreposição; mensagens orientam a correção de entradas inválidas.
- **Resultado da execução e correções:** não executado; evidência não disponível; reparos não registrados; zero ciclos executados.

### T21 – Token Google inválido ou expirado

- **Objetivo do teste:** validar o tratamento de token Google inválido ou expirado (RF-24, CF-09).
- **Nível:** integração · **Tipo:** funcional / segurança
- **Pré-condições:** RF-24 implementado; resposta de autenticação simulável com token inválido e expirado.
- **Procedimento:** enviar cada token ao retorno da autenticação Google e tentar acessar rota protegida.
- **Resultado esperado:** tokens rejeitados sem criação de sessão; acesso protegido negado; login local permanece disponível.
- **Resultado da execução e correções:** não executado; evidência não disponível; reparos não registrados; zero ciclos executados.

### T22 – Rota protegida sem sessão

- **Objetivo do teste:** validar rota protegida sem sessão (RF-02, CF-02; RF-24, CF-09 quando implementado).
- **Nível:** integração · **Tipo:** funcional / segurança
- **Pré-condições:** aplicação disponível; nenhuma sessão autenticada.
- **Procedimento:** acessar diretamente uma rota protegida pela interface e pela API, sem sessão; repetir após encerramento da sessão.
- **Resultado esperado:** acesso negado sem exposição de dados; interface encaminha ao login e API retorna resposta de não autorização.
- **Resultado da execução e correções:** não executado; evidência não disponível; reparos não registrados; zero ciclos executados.
