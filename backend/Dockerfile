FROM eclipse-temurin:21-jdk AS build

WORKDIR /build
COPY . .
RUN chmod +x ./mvnw
RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre

WORKDIR /app
COPY --from=build /build/target/sigea-gtt-backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
CMD ["java", "-jar", "app.jar"]