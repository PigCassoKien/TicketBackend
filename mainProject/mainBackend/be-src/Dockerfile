# Stage 1: Build stage
FROM openjdk:21-jdk-slim AS builder
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . ./
RUN mvn dependency:go-offline -DskipTests
RUN mvn clean package -DskipTests -Dfile.encoding=UTF-8 && rm -rf ~/.m2
RUN ls -l /app/target  # Kiểm tra tệp JAR được tạo

# Stage 2: Runtime stage
FROM eclipse-temurin:21-jre
RUN apt-get update && apt-get install -y tzdata curl && \
    ln -snf /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime && \
    echo "Asia/Ho_Chi_Minh" > /etc/timezone && \
    rm -rf /var/lib/apt/lists/*
RUN useradd -m appuser
WORKDIR /app
COPY --from=builder /app/target/be-src-0.0.1-SNAPSHOT.jar app.jar
RUN chown -R appuser:appuser /app && chmod -R 755 /app  # Sửa quyền thành 755 để có quyền thực thi
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]