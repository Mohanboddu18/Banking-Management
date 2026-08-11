# 🐳 Docker & Render Cloud Deployment Guide

This guide provides step-by-step instructions to containerize and deploy the **Godavari Bank Spring Boot Backend (Java 21)** on **Render** using Docker.

---

## 1. Why Docker on Render?

Render natively provides runtimes for Node.js, Python, Go, Rust, and Ruby, but does not provide a direct native Java runtime. By selecting **Docker**, Render automatically builds your containerized Spring Boot application and provides:
* **Zero-Downtime Deploys** with automated health checks (`/actuator/health`).
* **Free Managed SSL Certificate** (`https://<your-app>.onrender.com`).
* **Automated CI/CD** (auto-deploys upon every `git push`).

---

## 2. Multi-Stage Dockerfile Explained

The project includes an optimized multi-stage `Dockerfile` in `backend/Dockerfile`:

```dockerfile
# Stage 1: Build & Package with Maven & JDK 21
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Ultra-Lightweight Production Runtime (Alpine JRE 21)
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080

ENV PORT=8080 \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -Dserver.port=${PORT} -jar app.jar"]
```

### Key Optimizations:
1. **Layer Caching**: `pom.xml` dependencies are fetched once and cached across code changes.
2. **Alpine JRE 21 Base Image**: Keeps the final image under ~180MB (vs ~1.2GB for a JDK image).
3. **Container-Aware JVM Memory Tuning**: `-XX:MaxRAMPercentage=75.0` ensures the JVM never exceeds Render's 512MB RAM free tier limit.
4. **Dynamic Port Injection**: Respects `$PORT` injected by Render's internal load balancer.
5. **Non-Root User (`appuser`)**: Adheres to enterprise container security compliance.

---

## 3. Step 1: Set Up a Cloud MySQL Database

Before deploying the backend, you need a MySQL database accessible over the internet:

### Option A: Free Cloud MySQL on Aiven (Recommended)
1. Go to [aiven.io](https://aiven.io/) and create a free account.
2. Create a new **MySQL** service on the Free Plan.
3. Once running, copy your:
   - **Host** (e.g. `mysql-xyz.aivencloud.com`)
   - **Port** (e.g. `12345`)
   - **User** (e.g. `avnadmin`)
   - **Password** (e.g. `secretpassword`)
   - **Database Name** (e.g. `defaultdb` or `banking_management`)

Your JDBC URL will be:
```
jdbc:mysql://<HOST>:<PORT>/<DATABASE>?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC
```

### Option B: Free Cloud MySQL on Railway or Clever Cloud
* Create a free MySQL database on [Railway.app](https://railway.app/) or [Clever Cloud](https://www.clever-cloud.com/).
* Copy the `MYSQL_URL` and credentials.

---

## 4. Step 2: Push Your Project to GitHub

Initialize git if not already done:
```bash
git init
git add .
git commit -m "Initial commit of Godavari Bank Management System"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
git push -u origin main
```

---

## 5. Step 3: Deploy on Render

1. Log in to [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** $\to$ **Web Service**.
3. Select **"Build and deploy from a Git repository"** and choose your repository.
4. Fill in the service configuration:

| Setting | Value |
| :--- | :--- |
| **Name** | `godavari-bank-backend` |
| **Region** | Singapore, Frankfurt, or Oregon (choose closest) |
| **Branch** | `main` |
| **Root Directory** | `backend` (if you are pointing to the backend folder) or leave blank if deploying root |
| **Runtime** | **Docker** |
| **Dockerfile Path** | `./Dockerfile` (or `./backend/Dockerfile` if root directory is empty) |
| **Instance Type** | **Free** ($0 / month) |

---

## 6. Step 4: Configure Environment Variables on Render

In the **Environment Variables** section on the Render dashboard, add the following:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `PORT` | `8080` | Port for Spring Boot (Render auto-maps this) |
| `DB_URL` | `jdbc:mysql://mysql-xyz.aivencloud.com:12345/defaultdb?useSSL=true&allowPublicKeyRetrieval=true` | Your Cloud MySQL JDBC URL |
| `DB_USERNAME` | `avnadmin` | MySQL Username |
| `DB_PASSWORD` | `your-db-password` | MySQL Password |
| `JWT_SECRET` | `MySuperSecretKeyGodavariBankEnterpriseSecurityToken2026123456789` | Strong 256-bit secret key |
| `HIBERNATE_DDL_AUTO` | `update` | Automatically creates / updates tables |
| `SQL_INIT_MODE` | `always` | Automatically seeds demo customers & staff |

Click **"Create Web Service"**!

---

## 7. Step 5: Verify Deployment

Render will pull your repository, build the Docker container using Maven, launch the Alpine JRE runtime, and perform health checks on `/actuator/health`.

Once the dashboard shows **"Live"**:
1. Open `https://<your-app-name>.onrender.com/actuator/health` in your browser.
   - Expected Output: `{"status":"UP"}`
2. Open `https://<your-app-name>.onrender.com/swagger-ui.html` to explore the live Swagger UI.
3. Test a quick authentication call:
```bash
curl -X POST https://<your-app-name>.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1","password":"Password@123"}'
```

---

## 8. 💡 Tips for Render Free Tier

1. **Cold Starts**: Render free tier spins down containers after 15 minutes of inactivity. The first request after sleep may take ~30-45 seconds to spin up.
2. **Keep-Alive (Optional)**: You can use a free pinging service (like [UptimeRobot](https://uptimerobot.com/) or [Cron-Job.org](https://cron-job.org/)) to ping `https://<your-app>.onrender.com/actuator/health` every 10 minutes to keep the container warm.
