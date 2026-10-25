# -----------------------------------------------------------------------------
# Estágio 1: Build da aplicação React + Vite
# -----------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Instala as dependências do projeto
COPY package*.json ./
RUN npm ci

# Copia o código-fonte e compila os arquivos estáticos de produção
COPY . .
RUN npm run build

# -----------------------------------------------------------------------------
# Estágio 2: Servidor Web Nginx para servir os arquivos estáticos
# -----------------------------------------------------------------------------
FROM nginx:alpine AS runner

# Configuração customizada do Nginx com suporte a SPA (React Router) e cache
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos compilados do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

