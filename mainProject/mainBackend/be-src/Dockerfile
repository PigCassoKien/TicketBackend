# Stage 1: Build stage
FROM openjdk:21-jdk-slim AS builder
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY mainProject/mainBackend/be-src/pom.xml .
COPY mainProject/mainBackend/be-src/src ./src
COPY mainProject/mainBackend/be-src/src/main/resources/keystore.p12 ./src/main/resources/
COPY mainProject/mainBackend/be-src/src/main/resources/static ./src/main/resources/static
RUN mvn clean package -DskipTests -Dfile.encoding=UTF-8

# Stage 2: Runtime stage
FROM openjdk:21-jdk-slim
RUN apt-get update && apt-get install -y curl tzdata && ln -snf /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime && echo "Asia/Ho_Chi_Minh" > /etc/timezone && rm -rf /var/lib/apt/lists/*
ENV LANG=en_US.UTF-8
WORKDIR /app
COPY --from=builder /app/target/be-src-0.0.1-SNAPSHOT.jar app.jar
COPY --from=builder /app/src/main/resources/keystore.p12 /app/keystore.p12
COPY --from=builder /app/src/main/resources/static /app/src/main/resources/static
EXPOSE 8080
ENV PORT=8080 \
    SPRING_DATASOURCE_URL=jdbc:mysql://metro.proxy.rlwy.net:22869/ticketdb?useSSL=false&serverTimezone=Asia/Ho_Chi_Minh \
    SPRING_DATASOURCE_USERNAME=root \
    SPRING_DATASOURCE_PASSWORD=uBRvuyDvjGvFMJjxvnkhkNDPDvscGKmN \
    VNPAY_TMN_CODE=S9J1L8QI \
    VNPAY_RETURN_URL=https://ticketcinemaweb.onrender.com/api/payment/order-complete \
    VNPAY_IPN_URL=https://ticketcinemaweb.onrender.com/api/payment/ipn
ENTRYPOINT ["java", "-jar", "app.jar"]