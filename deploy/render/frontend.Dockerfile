FROM node:22-alpine AS build
WORKDIR /app
COPY frontend/MotivaFit/package*.json ./
RUN npm ci
COPY frontend/MotivaFit/ ./
# Nunca incorporar os .env locais na imagem publicada.
RUN rm -f .env .env.*
ARG VITE_GOOGLE_CLIENT_ID=""
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_API_BASE_URL=""
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY deploy/render/nginx.conf.template /etc/nginx/templates/default.conf.template
ENV PORT=10000
EXPOSE 10000
