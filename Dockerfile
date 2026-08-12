# =========================================================================
# Stage 1: Build & Package Spring Boot Application (Root Context)
# =========================================================================
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# 1. Copy pom.xml and cache Maven dependencies
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# 2. Copy backend source code and package application
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# =========================================================================
# Stage 2: Ultra-Lightweight Production Runtime (Alpine JRE 21)
# =========================================================================
FROM eclipse-temurin:21-jre-alpine

# Security: Create non-root system user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy compiled JAR from builder stage
COPY --from=builder /build/target/*.jar app.jar

# Set file ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Render dynamically injects $PORT (default to 8080)
EXPOSE 8080

# JVM container flags optimized for Render free/starter memory limits (512MB RAM)
ENV PORT=8080 \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/actuator/health || exit 1

# Start application
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -Dserver.port=${PORT} -jar app.jar"]
