# ==============================================================================
# STAGE 1: Build Stage
# ==============================================================================
# We use a Maven base image to compile the Java project and build the executable JAR.
# 'maven:3.9.6-eclipse-temurin-21-jammy' bundles Maven 3.9.6 and Eclipse Temurin JDK 21
# on an Ubuntu Jammy LTS base. JDK is required here because it contains compilation tools.
FROM maven:3.9.6-eclipse-temurin-21-jammy AS build

# Set the working directory inside the build container. All build commands 
# will run within this path.
WORKDIR /app

# Copy the pom.xml (Project Object Model) file.
# We copy this file first to allow dependency resolution layers to be cached.
COPY pom.xml .

# Download dependencies offline in Batch mode.
# 'mvn dependency:go-offline' resolves and downloads all dependencies into the local maven repository inside the image.
# The '-B' (batch mode) flag prevents Maven from outputting unnecessary progress bars, reducing log clutter.
# If pom.xml doesn't change, Docker will reuse this cached dependency layer, saving bandwidth and build time.
RUN mvn dependency:go-offline -B

# Copy the application source code into the build image.
# This copies the src/ folder containing java classes and resources (configs).
COPY src ./src

# Compile the code and package it as a runnable JAR.
# 'clean' deletes any existing target/ build folder.
# 'package' compiles code, runs tests, and packages it into a JAR file.
# '-DskipTests' skips unit tests execution during the packaging phase to speed up build.
# (Tests should run in CI/CD pipeline rather than container build).
RUN mvn clean package -DskipTests

# ==============================================================================
# STAGE 2: Runtime Stage
# ==============================================================================
# We run the application using a runtime-only JRE (Java Runtime Environment) image.
# In production, we do not need Maven or the full JDK compiler.
# 'eclipse-temurin:21-jre-jammy' contains only the JRE 21 on Ubuntu Jammy.
# This slims down the image size from 800MB+ to ~250MB and reduces the attack surface.
FROM eclipse-temurin:21-jre-jammy

# Set the working directory for the application inside the container.
WORKDIR /app

# Copy the compiled executable JAR file from the builder stage.
# We use a wildcard '*.jar' to match the artifact name (e.g. attendance-0.0.1-SNAPSHOT.jar)
# and rename it to a predictable 'app.jar' in the target container.
COPY --from=build /app/target/*.jar app.jar

# Expose port 8080.
# Inform docker and reverse proxy configurations that the Spring Boot app listens on port 8080 inside the container.
EXPOSE 8080

# Specify the default command to execute when the container starts.
# Runs the Spring Boot JAR inside the JVM.
# Entrypoint is written in exec form ["executable", "param1", "param2"] 
# so it receives OS signals (like SIGTERM) directly, allowing graceful shutdown.
ENTRYPOINT ["java", "-jar", "app.jar"]
