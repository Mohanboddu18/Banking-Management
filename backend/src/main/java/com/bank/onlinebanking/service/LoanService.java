package com.bank.onlinebanking.service;

import com.bank.onlinebanking.dto.loan.*;
import com.bank.onlinebanking.dto.transaction.TransactionResponse;
import com.bank.onlinebanking.entity.*;
import com.bank.onlinebanking.entity.enums.*;
import com.bank.onlinebanking.exception.*;
import com.bank.onlinebanking.repository.*;
import com.bank.onlinebanking.util.AmortizationCalculator;
import com.bank.onlinebanking.util.ReferenceGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final LoanTypeRepository loanTypeRepository;
    private final LoanRepaymentRepository loanRepaymentRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final EmployeeRepository employeeRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionTypeRepository transactionTypeRepository;
    private final AuthService authService;
    private final ReferenceGenerator referenceGenerator;
    private final AmortizationCalculator amortizationCalculator;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<LoanType> getAllLoanTypes() {
        return loanTypeRepository.findAll();
    }

    @Transactional
    public LoanResponse applyForLoan(String username, LoanApplicationRequest req) {
        Customer customer = customerRepository.findByUser_Username(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + username));

        LoanType loanType = loanTypeRepository.findByCode(req.getLoanTypeCode().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid loan type: " + req.getLoanTypeCode()));

        if (req.getRequestedAmount().compareTo(loanType.getMinAmount()) < 0 ||
            req.getRequestedAmount().compareTo(loanType.getMaxAmount()) > 0) {
            throw new BankingOperationException("Requested amount must be between ₹" + loanType.getMinAmount() + " and ₹" + loanType.getMaxAmount());
        }

        if (req.getTenureMonths() < loanType.getMinTenureMonths() ||
            req.getTenureMonths() > loanType.getMaxTenureMonths()) {
            throw new BankingOperationException("Tenure must be between " + loanType.getMinTenureMonths() + " and " + loanType.getMaxTenureMonths() + " months");
        }

        BigDecimal emi = amortizationCalculator.calculateMonthlyEmi(req.getRequestedAmount(), loanType.getInterestRate(), req.getTenureMonths());
        BigDecimal totalPayable = emi.multiply(BigDecimal.valueOf(req.getTenureMonths()));
        BigDecimal totalInterest = totalPayable.subtract(req.getRequestedAmount());

        String loanAccNum = referenceGenerator.generateLoanAccountNumber();

        Loan loan = Loan.builder()
                .customer(customer)
                .loanType(loanType)
                .loanAccountNumber(loanAccNum)
                .requestedAmount(req.getRequestedAmount())
                .approvedAmount(null)
                .interestRate(loanType.getInterestRate())
                .tenureMonths(req.getTenureMonths())
                .monthlyEmi(emi)
                .totalInterest(totalInterest)
                .totalPayable(totalPayable)
                .remainingPrincipal(req.getRequestedAmount())
                .remainingEmis(req.getTenureMonths())
                .employmentType(req.getEmploymentType())
                .monthlyIncome(req.getMonthlyIncome())
                .purpose(req.getPurpose())
                .status(LoanStatus.APPLIED)
                .build();

        loan = loanRepository.save(loan);

        auditLogService.logAction(customer.getUser().getId(), username, "ROLE_CUSTOMER", "APPLY_LOAN",
                "Loan", loanAccNum, null, "SUCCESS",
                "Applied for " + loanType.getName() + " of ₹" + req.getRequestedAmount() + " for " + req.getTenureMonths() + " months");

        notificationService.createNotification(customer, "Loan Application Submitted",
                "Your application for " + loanType.getName() + " (Ref: " + loanAccNum + ") for ₹" + req.getRequestedAmount() + " is under initial review by our Loan Officer.",
                NotificationType.LOAN);

        return mapToLoanResponse(loan);
    }

    @Transactional
    public LoanResponse reviewByLoanOfficer(Long loanId, String officerUsername, LoanOfficerReviewRequest req) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found with ID: " + loanId));

        if (loan.getStatus() != LoanStatus.APPLIED && loan.getStatus() != LoanStatus.UNDER_REVIEW) {
            throw new BankingOperationException("Loan cannot be reviewed in status: " + loan.getStatus());
        }

        Employee officer = employeeRepository.findByUser_Username(officerUsername).orElse(null);

        loan.setReviewedBy(officer);
        loan.setOfficerRecommendation(req.getRecommendation() + (req.getNotes() != null ? " - " + req.getNotes() : ""));
        loan.setStatus(LoanStatus.UNDER_REVIEW);
        loanRepository.save(loan);

        auditLogService.logAction(officer != null ? officer.getUser().getId() : null, officerUsername, "ROLE_EMPLOYEE_LOAN_OFFICER",
                "REVIEW_LOAN", "Loan", loan.getLoanAccountNumber(), null, "SUCCESS",
                "Loan Officer recommendation: " + req.getRecommendation());

        return mapToLoanResponse(loan);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public LoanResponse makeManagerDecision(Long loanId, String managerUsername, LoanManagerDecisionRequest req) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found with ID: " + loanId));

        if (loan.getStatus() == LoanStatus.APPROVED || loan.getStatus() == LoanStatus.ACTIVE) {
            throw new BankingOperationException("Loan is already approved!");
        }

        Employee manager = employeeRepository.findByUser_Username(managerUsername).orElse(null);
        Customer customer = loan.getCustomer();

        if ("APPROVE".equalsIgnoreCase(req.getDecision())) {
            BigDecimal approvedAmount = req.getApprovedAmount() != null && req.getApprovedAmount().compareTo(BigDecimal.ZERO) > 0
                    ? req.getApprovedAmount()
                    : loan.getRequestedAmount();

            loan.setApprovedAmount(approvedAmount);
            loan.setApprovedBy(manager);
            loan.setApprovedDate(LocalDateTime.now());
            loan.setStatus(LoanStatus.ACTIVE);

            // Recalculate EMI with approved amount
            BigDecimal emi = amortizationCalculator.calculateMonthlyEmi(approvedAmount, loan.getInterestRate(), loan.getTenureMonths());
            BigDecimal totalPayable = emi.multiply(BigDecimal.valueOf(loan.getTenureMonths()));
            BigDecimal totalInterest = totalPayable.subtract(approvedAmount);

            loan.setMonthlyEmi(emi);
            loan.setTotalInterest(totalInterest);
            loan.setTotalPayable(totalPayable);
            loan.setRemainingPrincipal(approvedAmount);
            loan.setRemainingEmis(loan.getTenureMonths());

            // 1. Generate Amortization Repayments Schedule
            EmiCalculationResponse schedule = amortizationCalculator.generateAmortizationSchedule(approvedAmount, loan.getInterestRate(), loan.getTenureMonths());
            LocalDate firstDueDate = LocalDate.now().plusMonths(1).withDayOfMonth(5);

            for (EmiCalculationResponse.AmortizationScheduleItem item : schedule.getSchedule()) {
                LoanRepayment repayment = LoanRepayment.builder()
                        .loan(loan)
                        .installmentNumber(item.getMonth())
                        .dueDate(firstDueDate.plusMonths(item.getMonth() - 1))
                        .emiAmount(item.getEmi())
                        .principalComponent(item.getPrincipal())
                        .interestComponent(item.getInterest())
                        .status(RepaymentStatus.PENDING)
                        .build();
                loanRepaymentRepository.save(repayment);
            }

            // 2. Disburse funds directly into customer's primary account!
            List<Account> accounts = accountRepository.findAllByCustomer_Id(customer.getId());
            if (!accounts.isEmpty()) {
                Account primaryAccount = accounts.get(0);
                Account lockedAcc = accountRepository.findByIdForUpdate(primaryAccount.getId()).orElseThrow();
                lockedAcc.setBalance(lockedAcc.getBalance().add(approvedAmount));
                lockedAcc.setLedgerBalance(lockedAcc.getLedgerBalance().add(approvedAmount));
                accountRepository.save(lockedAcc);

                TransactionType disburseType = transactionTypeRepository.findByCode("LOAN_DISBURSEMENT")
                        .orElseGet(() -> transactionTypeRepository.save(TransactionType.builder().code("LOAN_DISBURSEMENT").name("Loan Disbursement").build()));

                String txnRef = referenceGenerator.generateTransactionRef();
                Transaction txn = Transaction.builder()
                        .transactionRef(txnRef)
                        .toAccount(lockedAcc)
                        .transactionType(disburseType)
                        .amount(approvedAmount)
                        .balanceAfter(lockedAcc.getBalance())
                        .receiverBalanceAfter(lockedAcc.getBalance())
                        .description("Loan Sanction & Disbursement: " + loan.getLoanAccountNumber())
                        .status(TransactionStatus.SUCCESS)
                        .build();
                transactionRepository.save(txn);
            }

            auditLogService.logAction(manager != null ? manager.getUser().getId() : null, managerUsername, "ROLE_MANAGER",
                    "APPROVE_LOAN", "Loan", loan.getLoanAccountNumber(), null, "SUCCESS",
                    "Loan Approved for ₹" + approvedAmount + " with monthly EMI ₹" + emi);

            notificationService.createNotification(customer, "Loan Approved & Disbursed!",
                    "Your " + loan.getLoanType().getName() + " (" + loan.getLoanAccountNumber() + ") for ₹" + approvedAmount + " has been approved and credited to your account! Monthly EMI: ₹" + emi + ".",
                    NotificationType.LOAN);

        } else {
            loan.setStatus(LoanStatus.REJECTED);
            loan.setRejectionReason(req.getRemarks() != null ? req.getRemarks() : "Application rejected by Bank Manager.");
            loan.setApprovedBy(manager);

            auditLogService.logAction(manager != null ? manager.getUser().getId() : null, managerUsername, "ROLE_MANAGER",
                    "REJECT_LOAN", "Loan", loan.getLoanAccountNumber(), null, "SUCCESS",
                    "Loan Rejected. Reason: " + loan.getRejectionReason());

            notificationService.createNotification(customer, "Loan Application Rejected",
                    "Your loan application (" + loan.getLoanAccountNumber() + ") was rejected. Reason: " + loan.getRejectionReason(),
                    NotificationType.LOAN);
        }

        loan = loanRepository.save(loan);
        return mapToLoanResponse(loan);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TransactionResponse payLoanEmi(Long loanId, String username, EmiPaymentRequest req, String ipAddress) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + loanId));

        Customer customer = loan.getCustomer();
        if (!customer.getUser().getUsername().equals(username)) {
            throw new BankingOperationException("Access Denied: You do not own this loan");
        }

        if (loan.getStatus() != LoanStatus.ACTIVE) {
            throw new BankingOperationException("Cannot pay EMI for loan in status: " + loan.getStatus());
        }

        // Find next pending EMI installment
        List<LoanRepayment> repayments = loanRepaymentRepository.findAllByLoan_IdOrderByInstallmentNumberAsc(loanId);
        LoanRepayment nextPending = repayments.stream()
                .filter(r -> r.getStatus() == RepaymentStatus.PENDING || r.getStatus() == RepaymentStatus.OVERDUE)
                .findFirst()
                .orElseThrow(() -> new BankingOperationException("All EMIs for this loan have already been paid!"));

        Account account = accountRepository.findByAccountNumberForUpdate(req.getAccountNumber())
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + req.getAccountNumber()));

        if (!account.getCustomer().getUser().getUsername().equals(username)) {
            throw new BankingOperationException("Access Denied: You do not own this account");
        }

        // Validate PIN
        authService.validateCustomerPin(customer, req.getTransactionPin());

        // Validate Balance
        if (account.getBalance().compareTo(nextPending.getEmiAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient balance to pay EMI of ₹" + nextPending.getEmiAmount());
        }

        // Deduct balance
        BigDecimal newBalance = account.getBalance().subtract(nextPending.getEmiAmount());
        account.setBalance(newBalance);
        account.setLedgerBalance(account.getLedgerBalance().subtract(nextPending.getEmiAmount()));
        accountRepository.save(account);

        // Update Repayment
        String txnRef = referenceGenerator.generateTransactionRef();
        nextPending.setStatus(RepaymentStatus.PAID);
        nextPending.setPaidDate(LocalDateTime.now());
        nextPending.setTransactionRef(txnRef);
        loanRepaymentRepository.save(nextPending);

        // Update Loan Remaining Balances
        loan.setRemainingEmis(loan.getRemainingEmis() - 1);
        BigDecimal newRemPrincipal = loan.getRemainingPrincipal().subtract(nextPending.getPrincipalComponent());
        if (newRemPrincipal.compareTo(BigDecimal.ZERO) < 0 || loan.getRemainingEmis() == 0) {
            newRemPrincipal = BigDecimal.ZERO;
            loan.setStatus(LoanStatus.CLOSED);
        }
        loan.setRemainingPrincipal(newRemPrincipal);
        loanRepository.save(loan);

        // Transaction Record
        TransactionType emiType = transactionTypeRepository.findByCode("EMI_PAYMENT")
                .orElseGet(() -> transactionTypeRepository.save(TransactionType.builder().code("EMI_PAYMENT").name("Loan EMI Payment").build()));

        Transaction txn = Transaction.builder()
                .transactionRef(txnRef)
                .fromAccount(account)
                .transactionType(emiType)
                .amount(nextPending.getEmiAmount())
                .balanceAfter(newBalance)
                .description("EMI Payment #" + nextPending.getInstallmentNumber() + " for Loan " + loan.getLoanAccountNumber())
                .status(TransactionStatus.SUCCESS)
                .build();
        transactionRepository.save(txn);

        auditLogService.logAction(customer.getUser().getId(), username, "ROLE_CUSTOMER", "PAY_EMI",
                "Loan", loan.getLoanAccountNumber(), ipAddress, "SUCCESS",
                "Paid EMI #" + nextPending.getInstallmentNumber() + " of ₹" + nextPending.getEmiAmount());

        notificationService.createNotification(customer, "EMI Paid Successfully",
                "EMI #" + nextPending.getInstallmentNumber() + " of ₹" + nextPending.getEmiAmount() + " debited for Loan " + loan.getLoanAccountNumber() + ". Remaining EMIs: " + loan.getRemainingEmis(),
                NotificationType.LOAN);

        return TransactionResponse.builder()
                .id(txn.getId())
                .transactionRef(txnRef)
                .fromAccountNumber(account.getAccountNumber())
                .transactionType("EMI_PAYMENT")
                .transactionTypeName("Loan EMI Payment")
                .amount(nextPending.getEmiAmount())
                .balanceAfter(newBalance)
                .description(txn.getDescription())
                .status("SUCCESS")
                .entryType("DEBIT")
                .createdAt(txn.getCreatedAt())
                .build();
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TransactionResponse payAllRemainingEmis(Long loanId, String username, EmiPaymentRequest req, String ipAddress) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + loanId));

        Customer customer = loan.getCustomer();
        if (!customer.getUser().getUsername().equals(username)) {
            throw new BankingOperationException("Access Denied: You do not own this loan");
        }

        if (loan.getStatus() != LoanStatus.ACTIVE) {
            throw new BankingOperationException("Cannot foreclose loan in status: " + loan.getStatus());
        }

        // Find all pending EMI installments
        List<LoanRepayment> repayments = loanRepaymentRepository.findAllByLoan_IdOrderByInstallmentNumberAsc(loanId);
        List<LoanRepayment> pendingRepayments = repayments.stream()
                .filter(r -> r.getStatus() == RepaymentStatus.PENDING || r.getStatus() == RepaymentStatus.OVERDUE)
                .collect(Collectors.toList());

        if (pendingRepayments.isEmpty()) {
            throw new BankingOperationException("All EMIs for this loan have already been paid!");
        }

        // Total amount required to pay all remaining EMIs
        BigDecimal totalRemainingAmount = pendingRepayments.stream()
                .map(LoanRepayment::getEmiAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Account account = accountRepository.findByAccountNumberForUpdate(req.getAccountNumber())
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + req.getAccountNumber()));

        if (!account.getCustomer().getUser().getUsername().equals(username)) {
            throw new BankingOperationException("Access Denied: You do not own this account");
        }

        // Validate PIN
        authService.validateCustomerPin(customer, req.getTransactionPin());

        if (account.getBalance().compareTo(totalRemainingAmount) < 0) {
            throw new InsufficientBalanceException("Insufficient account balance to foreclose loan! Required: ₹" + totalRemainingAmount + ", Available: ₹" + account.getBalance());
        }

        // Lock and debit account
        Account lockedAcc = accountRepository.findByIdForUpdate(account.getId())
                .orElseThrow(() -> new AccountNotFoundException("Account locking failed."));

        BigDecimal newBalance = lockedAcc.getBalance().subtract(totalRemainingAmount);
        lockedAcc.setBalance(newBalance);
        lockedAcc.setLedgerBalance(lockedAcc.getLedgerBalance().subtract(totalRemainingAmount));
        accountRepository.save(lockedAcc);

        // Mark all repayments as PAID
        LocalDateTime now = LocalDateTime.now();
        String txnRef = referenceGenerator.generateTransactionRef();

        for (LoanRepayment rep : pendingRepayments) {
            rep.setStatus(RepaymentStatus.PAID);
            rep.setPaidDate(now);
            rep.setTransactionRef(txnRef);
            loanRepaymentRepository.save(rep);
        }

        loan.setRemainingEmis(0);
        loan.setRemainingPrincipal(BigDecimal.ZERO);
        loan.setStatus(LoanStatus.CLOSED);
        loanRepository.save(loan);

        // Transaction Record
        TransactionType emiType = transactionTypeRepository.findByCode("FULL_LOAN_FORECLOSURE")
                .orElseGet(() -> transactionTypeRepository.save(TransactionType.builder().code("FULL_LOAN_FORECLOSURE").name("Full Loan Foreclosure Settlement").build()));

        Transaction txn = Transaction.builder()
                .transactionRef(txnRef)
                .fromAccount(account)
                .transactionType(emiType)
                .amount(totalRemainingAmount)
                .balanceAfter(newBalance)
                .senderBalanceAfter(newBalance)
                .description("Full Loan Foreclosure & Settlement (" + pendingRepayments.size() + " EMIs) for Loan " + loan.getLoanAccountNumber())
                .status(TransactionStatus.SUCCESS)
                .build();
        transactionRepository.save(txn);

        auditLogService.logAction(customer.getUser().getId(), username, "ROLE_CUSTOMER", "PAY_ALL_EMIS",
                "Loan", loan.getLoanAccountNumber(), ipAddress, "SUCCESS",
                "Full Foreclosure paid ₹" + totalRemainingAmount + " across " + pendingRepayments.size() + " EMIs. Loan successfully CLOSED.");

        notificationService.createNotification(customer, "Loan Closed & Settled!",
                "Congratulations! Your " + loan.getLoanType().getName() + " (" + loan.getLoanAccountNumber() + ") has been fully settled and closed with a single payment of ₹" + totalRemainingAmount + " (Ref: " + txnRef + ").",
                NotificationType.LOAN);

        return TransactionResponse.builder()
                .id(txn.getId())
                .transactionRef(txnRef)
                .fromAccountNumber(account.getAccountNumber())
                .transactionType("FULL_LOAN_FORECLOSURE")
                .transactionTypeName("Full Loan Foreclosure Settlement")
                .amount(totalRemainingAmount)
                .balanceAfter(newBalance)
                .description(txn.getDescription())
                .status("SUCCESS")
                .entryType("DEBIT")
                .createdAt(txn.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<LoanResponse> getCustomerLoans(String username) {
        return loanRepository.findAllByCustomer_User_Username(username).stream()
                .map(this::mapToLoanResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LoanRepaymentResponse> getLoanRepayments(Long loanId, String username) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + loanId));

        return loanRepaymentRepository.findAllByLoan_IdOrderByInstallmentNumberAsc(loanId).stream()
                .map(r -> LoanRepaymentResponse.builder()
                        .id(r.getId())
                        .installmentNumber(r.getInstallmentNumber())
                        .dueDate(r.getDueDate())
                        .emiAmount(r.getEmiAmount())
                        .principalComponent(r.getPrincipalComponent())
                        .interestComponent(r.getInterestComponent())
                        .paidDate(r.getPaidDate())
                        .transactionRef(r.getTransactionRef())
                        .status(r.getStatus().name())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LoanResponse> getPendingLoansForReview() {
        return loanRepository.findAllByStatusIn(List.of(LoanStatus.APPLIED, LoanStatus.UNDER_REVIEW)).stream()
                .map(this::mapToLoanResponse)
                .collect(Collectors.toList());
    }

    public LoanResponse mapToLoanResponse(Loan l) {
        return LoanResponse.builder()
                .id(l.getId())
                .loanAccountNumber(l.getLoanAccountNumber())
                .customerId(l.getCustomer().getCustomerId())
                .customerName(l.getCustomer().getFullName())
                .loanTypeCode(l.getLoanType().getCode())
                .loanTypeName(l.getLoanType().getName())
                .requestedAmount(l.getRequestedAmount())
                .approvedAmount(l.getApprovedAmount())
                .interestRate(l.getInterestRate())
                .tenureMonths(l.getTenureMonths())
                .monthlyEmi(l.getMonthlyEmi())
                .totalInterest(l.getTotalInterest())
                .totalPayable(l.getTotalPayable())
                .remainingPrincipal(l.getRemainingPrincipal())
                .remainingEmis(l.getRemainingEmis())
                .employmentType(l.getEmploymentType())
                .monthlyIncome(l.getMonthlyIncome())
                .purpose(l.getPurpose())
                .status(l.getStatus().name())
                .officerRecommendation(l.getOfficerRecommendation())
                .rejectionReason(l.getRejectionReason())
                .appliedDate(l.getAppliedDate())
                .approvedDate(l.getApprovedDate())
                .build();
    }
}
