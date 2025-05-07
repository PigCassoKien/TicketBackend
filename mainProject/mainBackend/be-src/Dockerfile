# Stage 1: Build stage
FROM openjdk:21-jdk-slim AS builder

# Cài đặt Maven và các công cụ cần thiết
RUN apt-get update && \
    apt-get install -y maven && \
    rm -rf /var/lib/apt/lists/*

# Tạo thư mục làm việc
WORKDIR /app

# Copy file cấu hình Maven và mã nguồn từ thư mục cha
COPY mainProject/mainBackend/be-src/pom.xml .
COPY mainProject/mainBackend/be-src/src ./src

# Copy chứng chỉ SSL (keystore.p12) vào thư mục resources
COPY mainProject/mainBackend/be-src/src/main/resources/keystore.p12 ./src/main/resources/

# Build dự án với encoding UTF-8 và bỏ qua test
RUN mvn clean package -DskipTests -Dfile.encoding=UTF-8

# Stage 2: Runtime stage
FROM openjdk:21-jdk-slim

# Cài đặt curl và tzdata, thiết lập múi giờ
RUN apt-get update && \
    apt-get install -y curl tzdata && \
    ln -snf /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime && \
    echo "Asia/Ho_Chi_Minh" > /etc/timezone && \
    rm -rf /var/lib/apt/lists/*

# Thiết lập encoding
ENV LANG=en_US.UTF-8

# Tạo thư mục làm việc
WORKDIR /app

# Copy file JAR từ stage build
COPY --from=builder /app/target/be-src-0.0.1-SNAPSHOT.jar app.jar

# Copy chứng chỉ SSL
COPY --from=builder /app/src/main/resources/keystore.p12 /app/keystore.p12

# Mở cổng 8080
EXPOSE 8080

# Thiết lập biến môi trường không nhạy cảm
ENV PORT=8080 \
    SPRING_DATASOURCE_URL=jdbc:mysql://sql106.infinityfree.com:3306/if0_12345_ticketdb?useSSL=false&serverTimezone=Asia/Ho_Chi_Minh \
    SPRING_DATASOURCE_USERNAME=if0_12345_root \
    SPRING_DATASOURCE_PASSWORD=kien123456 \
    VNPAY_TMN_CODE=S9J1L8QI \
    VNPAY_RETURN_URL=https://ticketcinemaweb.onrender.com/api/payment/order-complete \
    VNPAY_IPN_URL=https://ticketcinemaweb.onrender.com/api/payment/ipn

# Chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]