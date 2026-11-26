FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
COPY backend/MotivaFIt/pom.xml ./
COPY backend/MotivaFIt/src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/MotivaFIt-0.0.1-SNAPSHOT.jar ./app.jar
USER 10001
EXPOSE 10000
# Render fornece os componentes da conexão; o driver Java exige uma URL JDBC.
CMD ["sh", "-c", "export DB_URL=\"jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}\"; exec java -jar app.jar"]
