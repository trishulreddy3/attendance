# ==============================================================================
# STAGE 1: Build Stage
# ==============================================================================
FROM maven:3.9.6-eclipse-temurin-21-jammy AS build

WORKDIR /app

# Copy pom.xml first to leverage Docker layer caching
COPY pom.xml .

# Download dependencies offline in batch mode
RUN mvn dependency:go-offline -B

# Copy application source code
COPY src ./src

# Compile and package application JAR (skipping unit tests during container build)
RUN mvn clean package -DskipTests

# ==============================================================================
# STAGE 2: Production Runtime Stage
# ==============================================================================
FROM eclipse-temurin:21-jre-jammy

LABEL maintainer="Pulse Attendance Team" \
      description="Production Spring Boot backend for Pulse Attendance Management System"

WORKDIR /app

# Create a non-privileged user and group for security
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/bash -m appuser

# Copy the compiled JAR artifact from the builder stage with proper ownership
COPY --from=build --chown=appuser:appgroup /app/target/*.jar app.jar

# Switch to non-root user
USER appuser:appgroup

# Container runtime environment variables
ENV PORT=8080 \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
