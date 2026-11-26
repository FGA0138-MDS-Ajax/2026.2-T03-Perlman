FROM node:22-alpine AS frontend
WORKDIR /build
COPY frontend/MotivaFit/package*.json ./
RUN npm ci
COPY frontend/MotivaFit/ ./
ARG GOOGLE_CLIENT_ID=""
ARG VITE_GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ARG VITE_API_BASE_URL=""
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM maven:3.9-eclipse-temurin-25 AS backend
WORKDIR /build
COPY backend/MotivaFIt/pom.xml ./
COPY backend/MotivaFIt/src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:25-jre-noble
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx supervisor \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=frontend /build/dist ./public
COPY --from=backend /build/target/MotivaFIt-0.0.1-SNAPSHOT.jar ./app.jar
COPY nginx/default.conf ./nginx.conf
COPY supervisord.conf ./supervisord.conf
ENV SPRING_PROFILES_ACTIVE=prod \
    SERVER_ADDRESS=127.0.0.1 \
    SERVER_PORT=8081 \
    JWT_ISSUER=motivafit \
    JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=65"
USER 10001:10001
EXPOSE 8080
CMD ["/usr/bin/supervisord", "-c", "/app/supervisord.conf"]
