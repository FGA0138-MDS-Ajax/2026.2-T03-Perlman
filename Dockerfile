FROM node:22-alpine AS frontend
WORKDIR /build
COPY frontend/MotivaFit/package*.json ./
RUN npm ci
COPY frontend/MotivaFit/ ./
ARG VITE_GOOGLE_CLIENT_ID=""
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_API_BASE_URL=""
RUN npm run build

FROM maven:3.9-eclipse-temurin-25 AS backend
WORKDIR /build
COPY backend/MotivaFIt/pom.xml ./
COPY backend/MotivaFIt/src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:25-jre-noble
RUN apt-get update && apt-get install -y --no-install-recommends nginx curl tini \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=frontend /build/dist ./public
COPY --from=backend /build/target/MotivaFIt-0.0.1-SNAPSHOT.jar ./app.jar
COPY nginx.prod.conf ./nginx.conf
COPY docker-entrypoint.sh ./start.sh
ENV SPRING_PROFILES_ACTIVE=prod \
    SERVER_ADDRESS=127.0.0.1 \
    SERVER_PORT=8081 \
    COOKIE_SECURE=true \
    JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=65"
USER 10001:10001
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
    CMD curl -fsS http://127.0.0.1:8080/ > /dev/null && \
        test "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8080/api/health-probe)" = 401
ENTRYPOINT ["/usr/bin/tini", "--", "/bin/bash", "/app/start.sh"]
