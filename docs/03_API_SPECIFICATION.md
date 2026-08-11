# 📡 REST API Specification — Godavari Bank

The **Godavari Bank REST API** follows OpenAPI 3.0 conventions with standard HTTP status codes and JSON envelopes (`ApiResponse<T>` and `ErrorResponse`).

Interactive Swagger UI documentation is available at:  
👉 **`http://localhost:8080/swagger-ui.html`** or **`https://<render-app-url>/swagger-ui.html`**

---

## 1. Standard Response Formats

### Success Response (`200 OK` / `201 CREATED`)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-08-11T20:30:00"
}
```

### Error Response (`400`, `401`, `403`, `404`, `409`, `500`)
```json
{
  "timestamp": "2026-08-11T20:30:00",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Transaction PIN must be 4 to 6 numeric digits",
  "validationErrors": {
    "transactionPin": "Transaction PIN must be 4 to 6 numeric digits"
  },
  "path": "/api/auth/register"
}
```

---

## 2. Authentication & Self-Service Endpoints (`/api/auth`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register customer, open bank account, credit initial deposit |
| `POST` | `/api/auth/login` | Public | Login with username/password, returns JWT token |
| `POST` | `/api/auth/forgot-password` | Public | Self-service password reset with PIN/PAN verification |
| `GET` | `/api/auth/me` | Bearer | Get profile of logged-in Customer/Staff/Manager |
| `POST` | `/api/auth/set-pin` | Customer | Set or change 4-digit financial transaction PIN |
| `POST` | `/api/auth/change-password` | Bearer | Change login password with old password verification |

---

## 3. Accounts & Cards Endpoints (`/api/accounts`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/accounts/my-accounts` | Customer | Get all active accounts owned by customer |
| `GET` | `/api/accounts/{accountNumber}` | Customer | Get account balance and summary |
| `POST` | `/api/accounts/cards/request` | Customer | Request instant virtual/physical Visa Platinum debit card |
| `GET` | `/api/accounts/cards/my-cards`| Customer | List all debit cards with card limits |
| `PUT` | `/api/accounts/cards/{id}/toggle-freeze` | Customer | Freeze / unfreeze debit card instantly |
| `POST` | `/api/accounts/beneficiaries` | Customer | Add new transfer payee beneficiary |
| `GET` | `/api/accounts/beneficiaries` | Customer | Get saved payee address book |

---

## 4. Financial Transactions & Statements (`/api/transactions`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/transactions/transfer` | Customer | Execute atomic P2P fund transfer with PIN authentication |
| `POST` | `/api/transactions/deposit` | Customer | Instant online fund deposit |
| `POST` | `/api/transactions/withdraw` | Customer | Self-service withdrawal with PIN |
| `GET` | `/api/transactions/my-transactions` | Customer | Recent transaction history (paged) |
| `GET` | `/api/transactions/statement/summary` | Customer | Summary metrics for date range |
| `GET` | `/api/transactions/statement/pdf` | Customer | Download official PDF statement (`application/pdf`) |
| `GET` | `/api/transactions/statement/csv` | Customer | Download CSV export (`text/csv`) |

---

## 5. Credit & Loans Hub (`/api/loans`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/loans/apply` | Customer | Apply for Personal, Home, or Business loan |
| `GET` | `/api/loans/my-loans` | Customer | View active and past loans with amortization tables |
| `POST` | `/api/loans/{loanId}/pay-emi` | Customer | Pay 1 single monthly EMI installment with PIN |
| `POST` | `/api/loans/{loanId}/pay-all-emis` | Customer | **⚡ 1-Click Foreclosure: Settle all remaining EMIs & close loan** |
| `PUT` | `/api/loans/{loanId}/review` | Loan Officer | Underwrite, review KYC, and recommend loan |
| `PUT` | `/api/loans/{loanId}/decision`| Manager | Sanction / reject loan and trigger auto-disbursement |

---

## 6. Value Added Services (`/api/vas`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/vas/qr/{merchantCode}` | Public | Look up merchant name and billing info |
| `POST` | `/api/vas/qr/pay` | Customer | Scan & Pay dynamic QR with transaction PIN |
| `GET` | `/api/vas/recharge/operators`| Public | List Airtel, Jio, VI, BSNL telecom plans |
| `POST` | `/api/vas/recharge/pay` | Customer | Execute mobile recharge / utility bill payment |
| `GET` | `/api/vas/movies/cities` | Public | List cinema cities (Mumbai, Hyderabad, Bengaluru, etc.) |
| `GET` | `/api/vas/movies/shows/{movie}`| Public | List cinemas, show timings, and seat availability |
| `POST` | `/api/vas/movies/book` | Customer | Reserve movie tickets and debit account with PIN |

---

## 7. Cashier Desk & Branch Operations (`/api/employee`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/employee/cashier/deposit` | Cashier | Counter cash deposit into customer account |
| `POST` | `/api/employee/cashier/withdraw`| Cashier | Counter cash withdrawal (no customer PIN required) |
| `GET` | `/api/employee/loans/pending` | Loan Officer | Queue of loans awaiting verification |
| `POST` | `/api/employee/cheques/issue` | Operations | Issue cheque book with 20 leaves |
| `POST` | `/api/employee/cheques/clear` | Operations | Clearinghouse cheque settlement |

---

## 8. Branch Executive Governance (`/api/manager`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/manager/analytics/overview`| Manager | Real-time liquidity, deposit vs loan ratios, NPA indicators |
| `GET` | `/api/manager/staff` | Manager | List all branch employees with roles |
| `POST` | `/api/manager/staff` | Manager | Onboard new employee (Cashier, Officer, Support) |
| `PUT` | `/api/manager/staff/{id}/toggle-status` | Manager | Activate / deactivate employee credentials |
| `GET` | `/api/manager/audit-logs` | Manager | Paged system-wide security & transaction audit logs |
| `GET` | `/api/manager/charges` | Manager | List bank charge rules (IMPS, NEFT, RTGS, SMS) |
| `PUT` | `/api/manager/charges/{id}` | Manager | Update transaction fee and limits |
