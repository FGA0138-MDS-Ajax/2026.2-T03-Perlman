# Documento de Arquitetura (MotivaFit)

**Equipe:** Grupo Perlman - T03  
**Disciplina:** Métodos de Desenvolvimento de Software (MDS) - UnB  
**Versão:** 1.7 - Revisada

## Histórico de Revisões
| Data | Versão | Descrição | Autor(es) |
| :--- | :--- | :--- | :--- |
| 03/10/2026 | 1.0 | Elaboração inicial do Documento de Arquitetura | Equipe Perlman |

---

## 1. Introdução

### 1.1 Propósito
Este documento descreve a arquitetura do sistema MotivaFit. Seu propósito é fornecer uma visão abrangente e padronizada do sistema para desenvolvedores, testadores e demais interessados, registrando as decisões arquiteturais e suas justificativas.

### 1.2 Escopo
O MotivaFit é uma aplicação web para organização de treinos, registro de execução e acompanhamento de progresso, com recursos posteriores de conquistas, desafios, rede social e painel administrativo. O MVP será concluído ao final da Sprint 4 e reúne exclusivamente os requisitos Must RF-01 a RF-11. Não fazem parte do escopo desta arquitetura aplicativos móveis nativos (o produto é web adaptável) e a criação de exercícios pelo usuário (exercícios são predefinidos).

### 1.3 Definições, Acrônimos e Abreviações
| Termo | Significado |
| :--- | :--- |
| **API** | Application Programming Interface (interface de programação de aplicações). |
| **CI** | Continuous Integration (integração contínua). |
| **JWT** | JSON Web Token, token assinado utilizado na autenticação sem estado (stateless). |
| **MVP** | Minimum Viable Product (produto mínimo viável). |
| **ORM** | Object-Relational Mapping (mapeamento objeto-relacional). |
| **REST** | Representational State Transfer, estilo de comunicação entre cliente e servidor sobre HTTP. |
| **SOLID** | Princípios de projeto orientado a objetos: responsabilidade única, aberto/fechado, substituição de Liskov, segregação de interfaces e inversão de dependência. |
| **SPA** | Single Page Application (aplicação de página única). |

---

## 2. Representação Arquitetural

### 2.1 Definições
O sistema adotará o estilo arquitetural **Cliente-Servidor (Client-Server)** e operará em múltiplos níveis (multi-tier). Haverá uma separação lógica e física bem definida entre a camada de apresentação (Frontend), a camada de processamento de negócio (Backend) e a estrutura de persistência (Banco de Dados). A comunicação ocorrerá exclusivamente por meio de uma API RESTful (JSON).

### 2.2 Justificativa da Escolha e Tecnologias
A escolha pelo modelo Cliente-Servidor baseia-se na separação de responsabilidades (Frontend/Backend paralelos), entregas curtas incrementais, isolamento de dados por segurança e facilidade