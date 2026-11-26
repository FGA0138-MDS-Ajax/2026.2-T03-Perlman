FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /build
COPY pom.xml ./
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:25-jre-noble
WORKDIR /app
COPY --from=build /build/target/MotivaFIt-0.0.1-SNAPSHOT.jar ./app.jar
ENV SERVER_ADDRESS=0.0.0.0 \
    SERVER_PORT=8080 \
    JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=65"
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
