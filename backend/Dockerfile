# Estágio 1: Build da aplicação
FROM eclipse-temurin:25-jdk AS build

WORKDIR /build

# Copia arquivos de dependências primeiro para aproveitar o cache de camadas do Docker
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN chmod +x mvnw

# Copia código-fonte e compila gerando o JAR executável
COPY src src
RUN ./mvnw -B -DskipTests package

# Estágio 2: Imagem final de execução (leve e segura)
FROM eclipse-temurin:25-jre

WORKDIR /app

# Criação de usuário sem privilégios administrativos (segurança)
RUN groupadd -r sigea && useradd -r -g sigea -s /bin/false sigea

# Copia o artefato compilado
COPY --from=build --chown=sigea:sigea /build/target/sigea-gtt-backend-0.0.1-SNAPSHOT.jar app.jar

USER sigea

EXPOSE 8080

# Otimizações de JVM para contêineres e inicialização rápida
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

CMD ["java", "-jar", "app.jar"]