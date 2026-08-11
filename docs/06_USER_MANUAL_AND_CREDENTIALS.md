# 👥 User Manual & Pre-Seeded Demo Credentials

This document catalogs all pre-seeded accounts, roles, access permissions, and end-to-end user workflows in the **Godavari Bank Online Management System**.

---

## 1. Complete Pre-Seeded Credentials Matrix

> [!NOTE]
> All pre-seeded demo accounts share the common password **`Password@123`** and the default financial transaction PIN **`1234`**.

### 1.1 Customer Retail Accounts (`ROLE_CUSTOMER`)

| Username | Full Name | Account Number | Initial Balance | PAN Card |
| :--- | :--- | :--- | :--- | :--- |
| `customer1` | Ramesh Patel | `SBIN00010001` | ₹50,000.00 | `ABCDE1234F` |
| `customer2` | Priya Sharma | `SBIN00010002` | ₹75,000.00 | `ABCDE2345G` |
| `customer3` | Rahul Verma | `SBIN00010003` | ₹120,000.00 | `ABCDE3456H` |
| `customer4` | Anita Desai | `SBIN00010004` | ₹35,000.00 | `ABCDE4567J` |
| `customer5` | Vikram Singh | `SBIN00010005` | ₹90,000.00 | `ABCDE5678K` |
| `customer6` | Sunita Reddy | `SBIN00010006` | ₹42,000.00 | `ABCDE6789L` |
| `customer7` | Amit Joshi | `SBIN00010007` | ₹15,000.00 | `ABCDE7890M` |
| `customer8` | Deepa Nair | `SBIN00010008` | ₹65,000.00 | `ABCDE8901N` |
| `customer9` | Sanjay Gupta | `SBIN00010009` | ₹88,000.00 | `ABCDE9012P` |
| `customer10`| Meera Iyer | `SBIN00010010` | ₹110,000.00 | `ABCDE0123Q` |

---

### 1.2 Bank Staff & Executive Accounts

| Username | Full Name | Role Code | Designation / Portal |
| :--- | :--- | :--- | :--- |
| `manager` | Alok Kumar | `ROLE_MANAGER` | **Branch Manager & Executive Governor** |
| `cashier` | Rajesh Gupta | `ROLE_EMPLOYEE_CASHIER` | **Head Cashier & Teller Counter** |
| `loan_officer` | Sneha Kulkarni | `ROLE_EMPLOYEE_LOAN_OFFICER` | **Senior Credit & Loan Underwriter** |
| `ops_officer` | Mahesh Shinde | `ROLE_EMPLOYEE_OPERATIONS` | **Cheque Clearing & Branch Operations** |
| `support_officer`| Kavita Sen | `ROLE_EMPLOYEE_CUSTOMER_SERVICE` | **Grievance Desk & Customer Support** |
| `asst_manager` | Suresh Menon | `ROLE_EMPLOYEE_ASST_MANAGER` | **Assistant General Manager** |

---

## 2. End-to-End User Workflows

### 2.1 Opening a New Bank Account
1. Go to **`/auth/register`** (or click "Open Bank Account" on login page).
2. Enter personal details (or click **`⚡ Auto-Fill Demo`** for instant KYC population).
3. Review address and choose account type (**Savings**, **Current**, or **Salary**).
4. Set an initial opening deposit (min ₹500) and choose a **4-digit transaction PIN** (e.g. `1234`).
5. Click **"Open My Account"** $\to$ Direct login into Customer Dashboard with generated account number!

---

### 2.2 Executing an Atomic Fund Transfer
1. Log in as any customer (e.g. `customer1`).
2. Navigate to **Transfer Money** (`/customer/transfer`).
3. Select your debit account and choose a beneficiary (or enter any account directly, e.g. `SBIN00010002`).
4. Enter the rupee amount and click **Transfer**.
5. Enter your 4-digit PIN (`1234`) on the on-screen keypad to confirm.
6. The funds are instantly debited and credited via pessimistic row-level database locking.

---

### 2.3 Applying for a Loan & 1-Click Full Settlement
1. **Apply**: Go to `/customer/loans` $\to$ Click "Apply for New Loan" $\to$ Submit Personal Loan ₹50,000 for 12 months.
2. **Staff Underwrite**: Log in as `loan_officer` $\to$ Go to `/employee/loans` $\to$ Click "Review Application" $\to$ Recommend loan.
3. **Manager Sanction**: Log in as `manager` $\to$ Go to `/manager/loans` $\to$ Click "Sanction Loan" $\to$ Loan is sanctioned, and ₹50,000 is auto-disbursed into the customer's account!
4. **Customer Repayment Options**:
   - **Pay 1 Month EMI**: Debits single monthly installment.
   - **⚡ Pay All EMIs in 1-Click**: Atomically debits the full remaining sum, marks all pending installments as `PAID`, sets `remainingPrincipal = 0`, and permanently closes the loan (`CLOSED`).

---

### 2.4 Cashier Counter Operations (No Customer PIN Required)
1. Log in as `cashier`.
2. Navigate to **Cashier Terminal** (`/employee/cashier`).
3. Enter Customer Account Number (e.g. `SBIN00010001`) and amount.
4. Click **Deposit Cash** or **Withdraw Cash**.
5. Teller executes the transaction directly without asking the customer for their private PIN.

---

### 2.5 Self-Service Forgot Password Recovery
1. On the login screen (`/auth/login`), click **"Forgot Password?"**.
2. Enter your username (e.g. `customer1`), mobile number, or account number.
3. Enter your 4-digit security PIN (`1234`) or PAN card number.
4. Enter and confirm your new password.
5. Click **Reset Password** $\to$ Password is encrypted and updated immediately!
