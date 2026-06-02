# Use Maven to build the application
FROM maven:3.9.6-eclipse-temurin-21-jammy AS build
WORKDIR /app
# Copy the pom.xml and download dependencies first (for caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B
# Copy the source code and build the JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Run the application using a smaller JRE image
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
