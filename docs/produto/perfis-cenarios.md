# 4.2 Perfis

Haverá dois perfis de acesso, o usuário e o administrador. O usuário poderá acessar todas as funcionalidades referentes ao uso do aplicativo, ficando livre para testar as funcionalidades, enquanto o perfil administrador acompanhará as métricas e informações do aplicativo, como número de usuários, funcionalidades mais usadas e tempo médio de usuário no app, dentre outros.

**Tabela 10 – Perfis de acesso**

| Perfil        | Características                                                                                                                                                                                                        | Permissões                         |
| :------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------- |
| Administrador | Acompanham as métricas de uso do aplicativo: quantos usuários acessaram nos últimos 30 dias, qual a frequência média de treino, quem está no topo das atividades e quais atividades estão sendo mais utilizadas. | Painel Admin (métricas).           |
| Usuário      | Atletas ou iniciantes em atividades físicas. Buscam registrar seus desempenhos individuais e comparar com seus amigos.                                                                                                 | Uso do app e métricas individuais. |

*Fonte: elaborado pelos autores (2026).*

## 4.3 Cenários

**Tabela 11 – Cenários funcionais**

| ID    | Cenário                                                                                                                                                       | Sprints |
| :---- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: |
| CF-01 | Novo usuário cria sua conta com e-mail e senha                                                                                                                |    3    |
| CF-02 | Usuário cadastrado deseja autenticar-se com e-mail e senha                                                                                                    |    3    |
| CF-03 | Usuário deseja cadastrar, listar, alterar ou excluir seus treinos                                                                                             |    3    |
| CF-04 | Usuário deseja cadastrar, listar, alterar e excluir exercícios de um treino e registrar sua execução                                                       |    4    |
| CF-05 | Usuário já possui acesso ao sistema e deseja acompanhar sua evolução nos treinos                                                                           |  5, 8  |
| CF-06 | Usuário já possui acesso ao sistema, já possui registros de exercícios, busca novos desafios e deseja comparar sua evolução com a de seu grupo de amigos | 7, 8, 9 |
| CF-07 | Administrador não possui acesso, mas pode receber um e-mail de convite para realizar seu cadastro                                                             |    5    |
| CF-08 | Administrador já tem acesso ao sistema e deseja acessar o painel de acompanhamento de métricas                                                               | 5, 6, 7 |
| CF-09 | Usuário deseja autenticar-se pelo Google como alternativa ao acesso com e-mail e senha, após a entrega do MVP                                                |  9, 10  |

*Fonte: elaborado pelos autores (2026).*
