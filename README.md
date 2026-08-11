# 🏛️ Godavari Bank — Enterprise Online Banking Management System

[![Java](https://img.shields.io/badge/Java-21%20LTS-orange.svg?style=flat&logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.3-brightgreen.svg?style=flat&logo=springboot)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-19.2-red.svg?style=flat&logo=angular)](https://angular.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg?style=flat&logo=mysql)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?style=flat&logo=docker)](https://www.docker.com/)
[![Render](https://img.shields.io/badge/Render-Deployable-46E3B7.svg?style=flat&logo=render)](https://render.com/)

A full-scale, enterprise-grade digital banking simulation platform engineered with **Java 21**, **Spring Boot 3**, **Spring Security (JWT)**, **Spring Data JPA**, **MySQL 8**, and **Angular 19** with high-fidelity glassmorphic UI.

---

## 📑 Complete Documentation Suite

All system documentation is organized under the [`/docs`](./docs) directory:

1. 🏛️ [**Architecture & System Design**](./docs/01_ARCHITECTURE_AND_DESIGN.md) — Layered architecture, security pipeline, pessimistic locking, and state machines.
2. 🗄️ [**Database Schema & ER Diagrams**](./docs/02_DATABASE_SCHEMA_AND_ER.md) — 16+ relational tables, indexes, constraints, and audit entities.
3. 📡 [**REST API Specification**](./docs/03_API_SPECIFICATION.md) — Detailed request/response payloads for 40+ REST endpoints with Swagger UI.
4. 🐳 [**Docker & Render Deployment Guide**](./docs/04_DOCKER_AND_RENDER_DEPLOYMENT_GUIDE.md) — Multi-stage Docker build, Cloud MySQL setup, and 1-click Render web service deployment.
5. 🌐 [**Frontend Deployment Guide**](./docs/05_FRONTEND_DEPLOYMENT_GUIDE.md) — Deploy Angular 19 on Vercel, Netlify, or Render Static Site.
6. 👥 [**User Manual & Pre-Seeded Credentials**](./docs/06_USER_MANUAL_AND_CREDENTIALS.md) — Role breakdown and all 16 test user logins with passwords and PINs.

---

## ⚡ Quick Start (Local Development)

### 1. Prerequisites
* **Java 21 LTS** & **Maven 3.9+**
* **Node.js v20+** & **npm 10+**
* **MySQL 8.0** running locally on port `3306` (or Docker)

### 2. Database Setup
```sql
CREATE DATABASE IF NOT EXISTS banking_management;
```

### 3. Start Backend (Spring Boot)
```bash
cd backend
mvn clean spring-boot:run
```
* API Server: `http://localhost:8080`
* Swagger UI Docs: `http://localhost:8080/swagger-ui.html`
* Actuator Health Probe: `http://localhost:8080/actuator/health`

### 4. Start Frontend (Angular 19)
```bash
cd frontend
npm install
npm start
```
* Customer & Staff Portal: `http://localhost:4200`

---

## 🐳 Run Entire Full-Stack with Docker Compose

To spin up MySQL, Spring Boot Backend, and configure everything automatically:
```bash
docker compose up --build -d
```

---

## 🚀 Key Functional Modules

| Module | Features & Capabilities |
| :--- | :--- |
| 👤 **Customer Banking** | Multi-account management, instant opening with KYC, transaction history, PDF/CSV statement export, virtual Visa Platinum debit card issuance, physical card PIN setting, and card freezing. |
| 💸 **Atomic Fund Transfers** | Pessimistic-locked P2P transfers between accounts, instant IFSC routing, beneficiary address book, and live PIN authentication keypad. |
| ⚡ **Value Added Services (VAS)** | Scan & Pay QR dynamic codes, telecom mobile recharge & bill payments, interactive cinema hall ticket booking with live seat matrices. |
| 🏦 **Cashier Counter Terminal** | Physical cash deposit, cash withdrawal with account balance verification, and teller audit logs. |
| 📑 **Credit & Loans Hub** | Personal, Home, and Business loans with multi-stage verification (Officer Review $\to$ Manager Sanction), EMI schedules, single installment payments, and **1-Click Full Foreclosure Settlement**. |
| 📜 **Cheque Management** | Digital cheque book issuance, cheque clearance clearinghouse simulation, and instant cheque stop payment. |
| 👑 **Branch Executive Governance** | Manager real-time analytics, liquidity indicators, employee staffing & role delegation, bank charge rules, customer KYC review, and system-wide audit trails. |

---

## 👥 Demo Logins

All demo accounts share default password: `Password@123` | Default Transaction PIN: `1234`

* **Customer**: `customer1`, `customer2`, `customer3` ... `customer10`
* **Branch Manager**: `manager`
* **Head Cashier**: `cashier`
* **Loan Officer**: `loan_officer`
* **Operations Officer**: `ops_officer`
* **Customer Support**: `support_officer`

---

## 📄 License & Compliance
Designed and engineered for educational, enterprise evaluation, and portfolio demonstration purposes following standard banking security and concurrency protocols.
