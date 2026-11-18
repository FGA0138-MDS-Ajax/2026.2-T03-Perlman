# Revisão documental do MotivaFit

Os documentos originais não foram alterados. Esta pasta contém a cópia revisada da Arquitetura (1.7), a cópia alinhada da Visão (1.0.1), seus PDFs e as fontes dos oito diagramas redesenhados.

## Decisões aplicadas

- MVP e Must limitados a RF-01 a RF-11. RF-12, RF-18, RF-19, RF-20 e RF-22 passam a Should, sem alteração de Sprint; ambas as matrizes e o backlog estão alinhados.
- Recordes numéricos automáticos por usuário, catálogo, métrica e distância de referência quando aplicável. Removido PUT de recorde; correções de execução recalculam projeções. Pace usa tempo e distância.
- Arquivamento de rotinas preserva histórico. Exclusão de conta é fluxo específico. Separadas definição e concessão de conquista; incluídos amizade, participantes, membros, convites e interações sociais.
- Hexad é referência de projeto. Separadas gamificação e rede social; removida associação indevida de Disruptor a desafios, e Philanthropist descrito como hipótese condicionada a ajuda altruísta.
- Dependências consumidor → provedor alinhadas nas figuras e riscos. Backend descrito em camadas por domínio; ORM localizado no Backend; modelos de dados identificados corretamente.
- CI descrita sem promessa de entrega contínua ou deploy automático. Gatilhos por Pull Request, cron diário e geração de artefatos separados. Acrescentados plano de migrações, backup e restauração.
- Métricas diretas para modularidade/extensibilidade; metas quantitativas para desempenho e usabilidade. Cobertura de 70% mantida como meta, com piloto para demonstrar viabilidade antes de ativar bloqueio.
- Três perfis, autenticação administrativa e bootstrap do primeiro superusuário. Rotas complementadas; catálogo mantido por administradores. CORS, refresh, revogação, CSRF, LGPD, exportação e exclusão de conta descritos.

## Limites e verificações

Esta é uma revisão de documentação, sem código de aplicação ou resultados de ensaios disponíveis. Metas de desempenho, cobertura, prazos de tokens, retenção e recuperação são decisões propostas e não medições ou homologações. Hospedagem, operador e bases legais devem ser definidos antes da primeira operação com dados reais. A reclassificação do backlog está registrada como proposta documental, sem atribuir aprovação inexistente ao P.O.

Verificados: abertura do DOCX, 14 tabelas, logo e oito diagramas; somente RF-01 a RF-11 permanecem Must nas Tabelas 7 e 13 e no backlog da Visão; ausência do PUT de recorde; compilação da Visão em três passagens; geração e inspeção de páginas do PDF da Arquitetura; atualização do sumário para a nova paginação.

Fontes editáveis dos diagramas: `fontes-diagramas/*.dot`, acompanhadas por PNG. Fontes da Visão: `documento-de-visao-v1.0.1/`, compiláveis com `bash compilar.sh` (XeLaTeX).
