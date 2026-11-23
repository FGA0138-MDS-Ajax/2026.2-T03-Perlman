# Relatório de execução de testes — GQM MotivaFit

**Data:** 23/11/2026
**Responsável pela execução:** Bernardo
**Escopo:** baseline automatizado do frontend/backend, integração API já registrada e definição dos fluxos de sistema que ainda precisam de execução manual.

> Este arquivo separa o que foi realmente executado do que continua pendente. Teste planejado não é apresentado como aprovado.

## 1. Resumo executivo

O checkout analisado é a branch `developer`/código correspondente ao estado de 19/11/2026. A execução mostrou:

- **Frontend:** o build de produção foi aprovado;

- **Frontend:** o lint terminou sem erros, mas apresentou 10 warnings;

- **Frontend:** a suíte terminou com 58 testes aprovados e 6 falhos, em 2 arquivos;

- **Backend:** com JDK diferente do exigido, a compilação falhou em `release 25`;

- **Backend:** com JDK 25 explícito, 266 testes foram executados, com 2 failures e 14 errors;

- **Backend:** parte dos testes de contexto não iniciou porque o ambiente não encontrou Docker para o Testcontainers;

- **Integração visual do Painel Admin:** já existe evidência separada no relatório de 19/11/2026;

- **Ainda não há:** um teste automatizado de navegador percorrendo frontend + backend + banco real.

A conclusão desta rodada é **não aprovado para fechamento da entrega** até os testes falhos do frontend e backend serem analisados e até a matriz de perfis e o fluxo principal do usuário serem executados com os serviços reais.

## 2. Resultado do frontend

### 2.1 Comandos executados

Executados na pasta `frontend/MotivaFit`:

```bash
npm test
npm run build
npm run lint
```

### 2.2 Build

**Resultado: APROVADO**

O comando `npm run build` concluiu a compilação de produção:

```
✓ built in 829ms
```

Foi emitido um aviso de chunk maior que 500 kB. Isso não bloqueou o build, mas pode virar melhoria de desempenho após a entrega.

### 2.3 Lint

**Resultado: APROVADO COM AVISOS**

```
Found 10 warnings and 0 errors.
```

Principais avisos:

- importação `waitFor` não utilizada em `tests/historico.test.tsx`;

- exportações de componentes junto com variantes/constantes;

- chamada de `new Date()` durante renderização em `pagina-historico.tsx`;

- atualização de estado síncrona dentro de efeito em `pagina-principal.tsx`.

Esses avisos não devem ser confundidos com falhas da suíte, mas o import não utilizado pode ser corrigido em um commit pequeno de qualidade.

### 2.4 Testes Vitest

**Resultado: REPROVADO**

```
Test Files  2 failed | 9 passed (11)
Tests       6 failed  | 58 passed (64)
```

Arquivos com falha:

- `tests/auth.test.tsx`: 2 testes falhos;

- `tests/theme.test.tsx`: 4 testes falhos.

Falhas observadas:

1. retorno para a tela de treinos após autenticação;

1. abertura direta de treinos quando a sessão é restaurada;

1. carregamento e salvamento do tema pela API;

1. recuperação do tema após falha da API;

1. descarte de resposta atrasada de outra conta;

1. botão de nova tentativa ao carregar preferências.

Em duas asserções, o valor observado ficou como `system` quando o teste esperava `dark`.

**Ação:** abrir issue para o frontend. Não registrar a suíte como aprovada enquanto esses seis testes falharem.

## 3. Resultado do backend

### 3.1 Primeira execução

O primeiro `mvn verify` falhou antes dos testes porque o Maven utilizou um Java incompatível com a configuração do projeto:

```
error: release version 25 not supported
```

O `pom.xml` exige:

```xml
<java.version>25</java.version>
```

### 3.2 Reexecução com JDK 25

A segunda execução foi feita com:

```bash
export JAVA_HOME=/home/ubuntu/jdks/jdk25
export PATH="$JAVA_HOME/bin:$PATH"
mvn verify
```

Resultado:

```
Tests run: 266, Failures: 2, Errors: 14, Skipped: 0
BUILD FAILURE
```

### 3.3 Falha de ambiente Testcontainers

Os testes de contexto do Spring tentaram iniciar PostgreSQL por Testcontainers, mas o ambiente não encontrou Docker:

```
Could not find a valid Docker environment
```

Consequentemente, os testes em `MotivaFItApplicationTests` não puderam carregar o `ApplicationContext`. Isso afeta, entre outros, cenários de rota protegida e autorização que deveriam ser executados com banco real.

**Classificação:** bloqueio de ambiente para a execução completa, não evidência suficiente de defeito funcional isolado.

### 3.4 Falhas funcionais ou de sincronização de testes

Também foram observadas falhas independentes do Testcontainers:

#### `CatalogoExercicioAdminServiceTest`

Alguns testes esperavam criar/alterar exercício sem imagem, mas o serviço agora retorna:

```
É obrigatório adicionar uma imagem ao exercício
```

Casos afetados incluem:

- `criaExercicioAtivoComDadosSemEspacosNasPontas`;

- `alteraExercicioExistente`;

- `nomeDeOutroExercicioNaAlteracaoGeraConflitoSemMudarOExercicio`;

- `nomeRepetidoNaCriacaoGeraConflitoSemSalvar`.

É necessário decidir se:

1. a imagem deve continuar obrigatória, atualizando os testes com um arquivo válido; ou

1. a obrigatoriedade foi introduzida indevidamente e o serviço deve ser corrigido.

#### `GoogleAuthServiceTest` e `LoginServiceTest`

Foram observados erros de Mockito, incluindo:

```
InvalidUseOfMatchersException
```

e `IllegalArgumentException` nos cenários do serviço de autenticação Google.

O login Google está sinalizado na interface como “em breve”, então o grupo precisa decidir se esses testes pertencem ao escopo desta entrega ou se a funcionalidade será formalmente adiada. Mesmo sendo opcional, testes quebrados não devem permanecer sem decisão.

## 4. Testes de integração e sistema já comprovados

O relatório visual anterior comprovou os seguintes casos administrativos:

- login de superusuário pela interface;

- redirecionamento para `/admin`;

- dashboard;

- catálogo;

- desativação de exercício;

- relatórios;

- tela de SuperUsuário;

- tela de treinos administrativos;

- CORS da origem encaminhada do navegador.

Referência:

```
docs/testes/integracao-admin/relatorio-integracao-admin-2026-11-19.md
```

Esses casos não substituem os testes do fluxo do usuário comum nem a matriz completa de autorização.

## 5. Testes de sistema que continuam pendentes

Os casos abaixo devem ser executados com frontend, backend e banco funcionando simultaneamente.

### Bloco A — Conta e sessão

| ID | Caso | Resultado necessário |
| --- | --- | --- |
| T1 | Cadastro pela interface | Conta persistida e login posterior funcionando |
| T2 | Login válido | Usuário chega à tela correta para seu perfil |
| T3 | Login inválido | Acesso negado sem vazamento de informação |
| T22 | Rota protegida sem sessão | Interface redireciona para login e API retorna 401 |
| S-A5 | Recarregar página | Sessão válida é restaurada por refresh |
| S-A6 | Logout | Token é limpo e rota protegida deixa de ser acessível |
| S-A7 | Sessão expirada | Sessão é encerrada sem loop de refresh |

### Bloco B — Treinos

| ID | Caso | Resultado necessário |
| --- | --- | --- |
| T4 | Criar treino | Treino aparece e persiste após recarga |
| T5 | Treino incompleto | Salvamento bloqueado, sem registro parcial |
| T6 | Alterar treino | Alteração persiste após recarga |
| T7 | Excluir treino | Cancelamento preserva; confirmação arquiva/remove da lista |
| T14 | Listar treinos | Próprios aparecem; privados de terceiros não aparecem |
| S-B6 | Copiar treino público | Cópia independente e privada é criada |
| S-B7 | Editar cópia | Original permanece inalterado |

### Bloco C — Exercícios do treino

| ID | Caso | Resultado necessário |
| --- | --- | --- |
| T15 | Adicionar exercício | Exercício e meta são persistidos na ficha |
| T16 | Listar exercícios | Nomes e metas corretos; vazio tratado |
| T17 | Alterar exercício | Meta alterada persiste sem afetar os demais |
| T18 | Excluir exercício | Apenas a associação selecionada é removida |
| S-C5 | Acesso de outra conta | Terceiro não lê nem altera treino privado |
| S-C6 | Falha parcial | Interface não anuncia sucesso integral indevidamente |

### Bloco D — Execução e histórico

| ID | Caso | Resultado necessário |
| --- | --- | --- |
| T8 | Registrar exercício | Dados persistem no backend e aparecem no histórico |
| S-D2 | Duplo envio | Idempotência impede duplicação indevida |
| S-D3 | Musculação | Carga, repetições e séries validados |
| S-D4 | Aeróbico | Tempo e distância validados |
| S-D5 | Histórico paginado | Carregar mais busca páginas adicionais |
| S-D6 | Conta diferente | Histórico não cruza entre usuários |

### Bloco E — Perfis e administração

| ID | Caso | Resultado necessário |
| --- | --- | --- |
| T11 | Usuário comum | Não acessa painel nem endpoints administrativos |
| S-E2 | Administrador | Acessa admin, mas não SuperUsuário |
| S-E3 | Superusuário | Acessa admin e convites |
| S-E4 | Criar exercício | Imagem válida é aceita e item aparece no catálogo |
| S-E5 | Editar exercício | Alteração aparece nos seletores |
| S-E6 | Desativar exercício | Item sai do catálogo ativo e histórico é preservado |
| S-E7 | Convite admin | Emissão, aceite, expiração e reutilização são tratados |
| S-E8 | Relatórios | Números batem com conjunto de dados conhecido |

### Bloco F — Usabilidade e compatibilidade

| ID | Caso | Resultado necessário |
| --- | --- | --- |
| T20 | Usabilidade do MVP | Fluxos sem bloqueio em desktop e tela estreita |
| S-F2 | Estado vazio | Mensagem de ausência sem erro técnico |
| S-F3 | Falha de API | Erro visível e botão de nova tentativa |
| S-F4 | Duplo clique | Uma única mutação é enviada |
| S-F5 | Navegação por teclado | Campos e botões acessíveis |

## 6. Funcionalidades não comprovadas ou fora do escopo atual

Não marcar como aprovadas sem implementação e contrato correspondentes:

- login com Google;

- recuperação de senha;

- desafios persistidos no backend;

- inscrições em fichas;

- recorde pessoal, se ainda não implementado;

- sessão de treino concluído;

- gestão global de alunos;

- relatórios administrativos completos, caso ainda usem dados locais.

A tela de desafios ainda acessa `localStorage`, e a tela de login informa que Google e recuperação de senha estão pendentes. Esses pontos devem ser marcados como **adiados**, caso não entrem na entrega final.



## 7. Conclusão

A rodada automatizada não aprova o projeto ainda. O build do frontend passou e uma parte expressiva dos testes backend isolados passou, mas existem falhas reais na suíte frontend, falhas de serviço/testes no backend e ausência de Docker para os testes de contexto. A maior contribuição do GQM nesta etapa é transformar essas falhas em evidência rastreável, abrir issues específicas e adicionar um teste E2E separado quando o ambiente de execução estiver definido.