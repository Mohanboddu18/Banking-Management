# 🏛️ Architecture & System Design — Godavari Bank

This document outlines the architectural blueprints, security design, transaction concurrency management, and state machine workflows of the **Godavari Bank Online Management System**.

---

## 1. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|  +-----------------------------------------------------------------------------+  |
|  | Angular 19 Standalone Single Page Application (SPA)                        |  |
|  | - Glassmorphic UI (Tailwind CSS) | Role-Based Route Guards | JWT Interceptors |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼ HTTPS / REST APIs (Port 8080 or $PORT)
+-----------------------------------------------------------------------------------+
|                             BACKEND APPLICATION TIER                              |
|                                                                                   |
|  [ CORS & Security Filter Chain ] ─────────────────────────────────────────────┐  |
|  ├── JwtAuthFilter (Extracts Bearer Token, validates signature & expiry)       │  |
|  ├── DaoAuthenticationProvider (BCryptPasswordEncoder)                         │  |
|  └── Role-Based Endpoint Authorizer (@PreAuthorize & SecurityFilterChain)     │  |
|                                                                                │  |
|  [ REST API Controllers ]                                                      │  |
|  ├── AuthController          ├── AccountController     ├── TransactionController│
|  ├── LoanController          ├── ChequeController      ├── VasController        │
|  ├── EmployeeController      ├── ManagerController     └── PublicController     │  |
|                                                                                │  |
|  [ Business Logic & Service Layer ]                                            │  |
|  ├── AuthService             ├── AccountService        ├── TransactionService   │  |
|  ├── LoanService             ├── ChequeService         ├── AuditLogService      │  |
|  ├── NotificationService     ├── EmployeeService       └── ManagerService       │  |
|                                                                                │  |
|  [ Concurrency & Financial Integrity Engine ]                                  │  |
|  ├── Pessimistic Database Row Locking (@Lock(LockModeType.PESSIMISTIC_WRITE)) │  |
|  ├── Atomic Multi-Account Ledger Updating (@Transactional Isolation)          │  |
|  ├── Reference & Txn ID Generator (Unique SBIN/GDVB, TXN, CHQ, LN sequences)  │  |
|  └── Stream Document Builders (OpenPDF Vector Engine & Apache Commons CSV)    │  |
|                                                                                │  |
|  [ Data Access & Persistence Tier (Spring Data JPA / Hibernate 6) ]            │  |
|  └── 34 Entity Repositories with custom JPQL queries & explicit LEFT JOINs     │  |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼ JDBC Connection Pool (HikariCP)
+-----------------------------------------------------------------------------------+
|                                  DATABASE TIER                                    |
|  +-----------------------------------------------------------------------------+  |
|  | MySQL 8.0 Relational Database Engine                                        |  |
|  | - ACID Compliance | InnoDB Engine | Row-Level Locks | Foreign Key Constraints| |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Layered Architecture Principles

The backend is built following strict **Clean Layered Architecture** standards:

```
src/main/java/com/bank/onlinebanking/
├── config/              # Spring Security, CORS, OpenAPI Swagger, Data Initializer
├── controller/          # REST Endpoints handling HTTP requests & response wrapping
├── dto/                 # Data Transfer Objects with Bean Validation constraints
│   ├── account/         # Account creation, Beneficiary, Debit card DTOs
│   ├── auth/            # Login, Register, Forgot Password, PIN management DTOs
│   ├── common/          # Standard ApiResponse<T> and ErrorResponse wrappers
│   ├── loan/            # Loan application, review, sanction, repayment DTOs
│   ├── manager/         # Executive metrics, staffing, charge rules DTOs
│   ├── transaction/     # Transfer, Deposit, Withdraw, Statement DTOs
│   └── vas/             # QR Pay, Mobile Recharge, Movie Booking DTOs
├── entity/              # JPA Hibernate Entities mapped to MySQL tables
│   └── enums/           # Strong Java Enums for roles, statuses, and categories
├── exception/           # Custom exception classes & GlobalExceptionHandler (@RestControllerAdvice)
├── repository/          # Spring Data JPA Repository interfaces
├── security/            # JWT Token Provider, Auth Filter, UserPrincipal, UserDetailsService
├── service/             # Transactional business logic, calculations, audits
└── util/                # Reference generators, PDF & CSV exporters
```

---

## 3. Security & Authentication Architecture

### 3.1 JWT Token Lifecycle
1. **Authentication Request**: User submits credentials (`username` / `password`) to `/api/auth/login`.
2. **Credential Verification**: Spring Security's `AuthenticationManager` delegates to `DaoAuthenticationProvider`, verifying the BCrypt hash against the database.
3. **Token Generation**: On success, `JwtUtils` generates a cryptographically signed HMAC-SHA256 JWT containing:
   - `sub`: Username
   - `roles`: Granted authority list (`ROLE_CUSTOMER`, `ROLE_MANAGER`, `ROLE_EMPLOYEE_...`)
   - `iat`: Issued at timestamp
   - `exp`: Expiration timestamp (24 hours default)
4. **Token Interception**: For all protected routes, `JwtAuthFilter` extracts the `Bearer <token>`, validates the cryptographic signature, extracts the user details, and sets the authenticated `SecurityContextHolder`.

### 3.2 Role-Based Access Control (RBAC) Matrix

| User Role | Dashboard | Accounts & Transfers | Loans | Cashier Desk | Cheques | Staffing & Rules |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **ROLE_CUSTOMER** | Customer Hub | Full Access | Apply & Repay | ❌ | Request & Stop | ❌ |
| **ROLE_EMPLOYEE_CASHIER** | Staff Hub | ❌ | ❌ | Cash In/Out | ❌ | ❌ |
| **ROLE_EMPLOYEE_LOAN_OFFICER** | Staff Hub | ❌ | Review & Recommend | ❌ | ❌ | ❌ |
| **ROLE_EMPLOYEE_OPERATIONS** | Staff Hub | ❌ | ❌ | ❌ | Verify & Clear | ❌ |
| **ROLE_EMPLOYEE_CUSTOMER_SERVICE** | Staff Hub | ❌ | ❌ | ❌ | ❌ | Resolve Grievances |
| **ROLE_MANAGER** / **ROLE_ADMIN** | Executive Hub | Full Oversight | Sanction & Disburse | Oversight | Oversight | Full Control |

---

## 4. Concurrency & Financial Transaction Integrity

### 4.1 Race Condition Prevention with Pessimistic Locking
To prevent double-spending, negative account balances, and race conditions during simultaneous fund transfers, the repository employs **Pessimistic Write Row Locking**:

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT a FROM Account a WHERE a.accountNumber = :accountNumber")
Optional<Account> findByAccountNumberWithLock(@Param("accountNumber") String accountNumber);
```

### 4.2 Deadlock Avoidance Algorithm
When transferring funds between Account A and Account B:
1. The service sorts account numbers lexicographically before acquiring row locks (`accA.compareTo(accB)`).
2. Locks are always acquired in consistent ascending order across all threads.
3. This eliminates cyclic lock wait graphs, guaranteeing **zero deadlocks** under high concurrent load.

```java
Account firstLock = senderAcc.getAccountNumber().compareTo(receiverAcc.getAccountNumber()) < 0 ? senderAcc : receiverAcc;
Account secondLock = firstLock == senderAcc ? receiverAcc : senderAcc;
// Lock firstLock then secondLock -> Atomic Debit & Credit -> Save Ledger
```

---

## 5. System State Machines

### 5.1 Loan Application & Sanction Lifecycle
```
[ Customer Submits Application ]
               │
               ▼
           ( APPLIED )
               │
               ▼  [ Loan Officer Reviews Documents & Credit ]
        ( UNDER_REVIEW )
          ├── RECOMMENDED ──────┐
          └── REJECTED          │
                                ▼  [ Branch Manager Decision ]
                         ( SANCTIONED / ACTIVE )
                                │  ├── Auto-Disburses Funds into Customer Account
                                │  └── Generates Monthly Amortization Schedule
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
            [ Pay Single EMI ]     [ ⚡ 1-Click Foreclosure ]
                    │                       │
                    └───────────┬───────────┘
                                ▼ (All EMIs Paid = 0)
                            ( CLOSED )
```

### 5.2 Cheque Clearance Lifecycle
```
[ Customer Requests Cheque Book ] ──► ( ISSUED )
                                           │
                                           ▼ [ Deposited at Counter ]
                                      ( DEPOSITED )
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
                [ Sufficient Balance ]              [ Insufficient / Stopped ]
                        │                                     │
                        ▼                                     ▼
                   ( CLEARED )                           ( BOUNCED )
```
