# MotivaFit - Frontend

Aplicação web do projeto **MotivaFit**, desenvolvida com **React**, **TypeScript**, **Vite**, **Tailwind CSS** e **Shadcn/UI**.

---

## 🚀 Como Executar o Projeto com Docker

O projeto possui configurações prontas para execução em contêineres Docker tanto para **desenvolvimento** quanto para **produção**.

---

### 🛠️ 1. Modo Desenvolvimento

Neste modo, o contêiner utiliza a imagem do Node.js com mapeamento de volume para habilitar o **Hot Module Replacement (HMR)**. Qualquer alteração no código-fonte é refletida imediatamente no navegador.

- **URL de acesso:** [http://localhost:5173](http://localhost:5173)

#### Iniciar a aplicação:
```bash
docker compose -f docker-compose.dev.yml up
```
*(ou adicione a flag `-d` para rodar em segundo plano)*

#### Parar a aplicação:
- Se estiver rodando no terminal sem `-d`, pressione:
  ```bash
  Ctrl + C
  ```
- Para parar e remover os contêineres e a rede:
  ```bash
  docker compose -f docker-compose.dev.yml down
  ```

---

### 🏭 2. Modo Produção

Neste modo, a aplicação passa por um processo de compilação (*multi-stage build*) com Node.js e os arquivos estáticos gerados são servidos através de um servidor **Nginx** otimizado, com compressão Gzip e suporte a rotas SPA (*Single Page Application*).

- **URL de acesso:** [http://localhost:4173](http://localhost:4173)

#### Iniciar a aplicação:
```bash
docker compose up -d --build
```

#### Parar a aplicação:
```bash
docker compose down
```

---

## 💻 Execução Local (sem Docker)

Caso prefira rodar diretamente na sua máquina via Node.js (necessário Node.js 22+):

### Instalação das dependências:
```bash
npm install
```

### Desenvolvimento:
- **Iniciar:**
  ```bash
  npm run dev
  ```
- **Parar:** Pressione `Ctrl + C` no terminal.

### Produção:
- **Build e Pré-visualização:**
  ```bash
  npm run build
  npm run preview
  ```
- **Parar:** Pressione `Ctrl + C` no terminal.

---

## 🧭 Rotas Principais da Aplicação

| Rota | Descrição |
| :--- | :--- |
| `/` | Página inicial / Apresentação |
| `/login` | Página de autenticação |
| `/cadastro` | Formulário de registro |
| `/principal` | Dashboard principal do usuário |
| `/admin` | Painel administrativo e catálogo de exercícios |
