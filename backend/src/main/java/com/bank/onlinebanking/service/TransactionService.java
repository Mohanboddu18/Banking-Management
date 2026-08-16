package com.bank.onlinebanking.service;

import com.bank.onlinebanking.dto.common.PagedResponse;
import com.bank.onlinebanking.dto.transaction.*;
import com.bank.onlinebanking.entity.*;
import com.bank.onlinebanking.entity.enums.AccountStatus;
import com.bank.onlinebanking.entity.enums.NotificationType;
import com.bank.onlinebanking.entity.enums.TransactionStatus;
import com.bank.onlinebanking.exception.AccountNotFoundException;
import com.bank.onlinebanking.exception.AccountSuspendedException;
import com.bank.onlinebanking.exception.InsufficientBalanceException;
import com.bank.onlinebanking.repository.*;
import com.bank.onlinebanking.util.CsvStatementGenerator;
import com.bank.onlinebanking.util.PdfStatementGenerator;
import com.bank.onlinebanking.util.ReferenceGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import com.bank.onlinebanking.entity.enums.CardStatus;
import com.bank.onlinebanking.exception.BankingOperationException;
import com.bank.onlinebanking.exception.InvalidTransactionPinException;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionTypeRepository transactionTypeRepository;
    private final DebitCardRepository debitCardRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;
    private final ReferenceGenerator referenceGenerator;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final PdfStatementGenerator pdfStatementGenerator;
    private final CsvStatementGenerator csvStatementGenerator;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TransactionResponse deposit(DepositRequest req, String username, String ipAddress) {
        Account account = accountRepository.findByAccountNumberForUpdate(req.getAccountNumber())
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + req.getAccountNumber()));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountSuspendedException("Cannot deposit to account with status: " + account.getStatus());
        }

        boolean isAtmCardDeposit = "ATM_CARD".equalsIgnoreCase(req.getDepositMethod())
                || (req.getCardNumber() != null && !req.getCardNumber().trim().isEmpty())
                || (req.getAtmPin() != null && !req.getAtmPin().trim().isEmpty());

        boolean isCashier = username != null && !account.getCustomer().getUser().getUsername().equals(username);

        BigDecimal maxPerTxn = isAtmCardDeposit ? BigDecimal.valueOf(200000) : BigDecimal.valueOf(500000);
        BigDecimal maxDaily = isAtmCardDeposit ? BigDecimal.valueOf(200000) : (isCashier ? BigDecimal.valueOf(1000000) : BigDecimal.valueOf(1000000));

        if (req.getAmount().compareTo(maxPerTxn) > 0) {
            String methodText = isAtmCardDeposit ? "ATM Card Deposit" : "Direct Cash Deposit";
            throw new BankingOperationException(
                methodText + " amount ₹" + String.format("%,.2f", req.getAmount()) + 
                " exceeds maximum per-transaction limit of ₹" + String.format("%,.2f", maxPerTxn) + "!"
            );
        }

        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        BigDecimal existing24hDeposits = isAtmCardDeposit
                ? transactionRepository.sumAtmCardDepositsForAccountSince(account.getId(), twentyFourHoursAgo)
                : transactionRepository.sumDepositsForAccountSince(account.getId(), twentyFourHoursAgo);

        if (existing24hDeposits.add(req.getAmount()).compareTo(maxDaily) > 0) {
            BigDecimal remaining = maxDaily.subtract(existing24hDeposits);
            if (remaining.compareTo(BigDecimal.ZERO) < 0) remaining = BigDecimal.ZERO;
            String channelStr = isAtmCardDeposit ? "ATM Debit Card" : "Direct Cash";
            throw new BankingOperationException(
                "24-Hour " + channelStr + " deposit limit of ₹" + String.format("%,.2f", maxDaily) + " exceeded for account " + account.getAccountNumber() + 
                "! Total " + channelStr + " deposits in last 24 hours: ₹" + String.format("%,.2f", existing24hDeposits) + 
                ". Remaining limit: ₹" + String.format("%,.2f", remaining)
            );
        }

        DebitCard debitCard = null;
        if (isAtmCardDeposit) {
            String rawCardNum = req.getCardNumber() != null ? req.getCardNumber().replaceAll("[\\s-]", "") : null;
            if (rawCardNum != null && !rawCardNum.isEmpty()) {
                debitCard = debitCardRepository.findByCardNumber(rawCardNum)
                        .or(() -> debitCardRepository.findAllByAccount_Id(account.getId()).stream().findFirst())
                        .orElse(null);
            } else {
                debitCard = debitCardRepository.findAllByAccount_Id(account.getId()).stream().findFirst().orElse(null);
            }

            if (debitCard != null) {
                if (debitCard.getStatus() != CardStatus.ACTIVE) {
                    throw new BankingOperationException("ATM Card is " + debitCard.getStatus() + ". Only active cards can be used for deposits.");
                }

                // Validate PIN if provided
                if (req.getAtmPin() != null && !req.getAtmPin().trim().isEmpty()) {
                    String pin = req.getAtmPin().trim();
                    if (debitCard.getPinHash() != null) {
                        if (!passwordEncoder.matches(pin, debitCard.getPinHash())) {
                            throw new InvalidTransactionPinException("Incorrect 4-Digit ATM PIN for card " + debitCard.getMaskedCardNumber());
                        }
                    } else {
                        // Fallback to customer's transaction pin
                        authService.validateCustomerPin(account.getCustomer(), pin);
                    }
                }
            }
        }

        BigDecimal oldBalance = account.getBalance();
        BigDecimal newBalance = oldBalance.add(req.getAmount());
        account.setBalance(newBalance);
        account.setLedgerBalance(account.getLedgerBalance().add(req.getAmount()));
        accountRepository.save(account);

        TransactionType txnType = transactionTypeRepository.findByCode("DEPOSIT")
                .orElseGet(() -> transactionTypeRepository.save(TransactionType.builder().code("DEPOSIT").name("Cash / Direct Deposit").build()));

        String txnRef = referenceGenerator.generateTransactionRef();
        String desc = req.getDescription() != null && !req.getDescription().isEmpty()
                ? req.getDescription()
                : (debitCard != null ? "ATM Card Deposit (" + debitCard.getMaskedCardNumber() + ")" : "Cash Deposit");

        Transaction txn = Transaction.builder()
                .transactionRef(txnRef)
                .toAccount(account)
                .transactionType(txnType)
                .amount(req.getAmount())
                .balanceAfter(newBalance)
                .receiverBalanceAfter(newBalance)
                .description(desc)
                .status(TransactionStatus.SUCCESS)
                .build();
        txn = transactionRepository.save(txn);

        auditLogService.logAction(account.getCustomer().getUser().getId(), username != null ? username : "CASHIER",
                "TRANSACTION", "DEPOSIT", "Account", account.getAccountNumber(), ipAddress, "SUCCESS",
                "Deposited ₹" + req.getAmount() + " into " + account.getAccountNumber() + ". New Balance: ₹" + newBalance + (debitCard != null ? " [ATM Card: " + debitCard.getMaskedCardNumber() + "]" : ""));

        notificationService.createNotification(account.getCustomer(), "Account Credited",
                "₹" + req.getAmount() + " has been credited to your account " + account.getAccountNumber() + ". Available Balance: ₹" + newBalance + " (Ref: " + txnRef + ")",
                NotificationType.DEPOSIT);

        return mapToTransactionResponse(txn, account.getAccountNumber());
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TransactionResponse withdraw(WithdrawRequest req, String username, String ipAddress) {
        Account account = accountRepository.findByAccountNumberForUpdate(req.getAccountNumber())
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + req.getAccountNumber()));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountSuspendedException("Cannot withdraw from account with status: " + account.getStatus());
        }

        Customer customer = account.getCustomer();
        if (username != null && !customer.getUser().getUsername().equals(username)) {
            throw new AccountSuspendedException("Access Denied: You do not own this account");
        }

        String pin = req.getAtmPin() != null && !req.getAtmPin().trim().isEmpty()
                ? req.getAtmPin().trim()
                : req.getTransactionPin();

        if (pin == null || pin.trim().isEmpty()) {
            throw new InvalidTransactionPinException("Transaction / ATM PIN is required to authorize withdrawal");
        }

        DebitCard debitCard = null;
        String rawCardNum = req.getCardNumber() != null ? req.getCardNumber().replaceAll("[\\s-]", "") : null;
        if (rawCardNum != null && !rawCardNum.isEmpty()) {
            debitCard = debitCardRepository.findByCardNumber(rawCardNum)
                    .or(() -> debitCardRepository.findAllByAccount_Id(account.getId()).stream().findFirst())
                    .orElse(null);
        } else {
            debitCard = debitCardRepository.findAllByAccount_Id(account.getId()).stream().findFirst().orElse(null);
        }

        BigDecimal maxPerTxn = BigDecimal.valueOf(50000);
        if (req.getAmount().compareTo(maxPerTxn) > 0) {
            throw new BankingOperationException("ATM cash withdrawal cannot exceed ₹50,000 per transaction!");
        }

        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        BigDecimal existing24hWithdrawals = transactionRepository.sumWithdrawalsForAccountSince(account.getId(), twentyFourHoursAgo);
        BigDecimal maxDaily = (debitCard != null && debitCard.getDailyLimit() != null) ? debitCard.getDailyLimit() : BigDecimal.valueOf(100000);

        if (existing24hWithdrawals.add(req.getAmount()).compareTo(maxDaily) > 0) {
            BigDecimal remaining = maxDaily.subtract(existing24hWithdrawals);
            if (remaining.compareTo(BigDecimal.ZERO) < 0) remaining = BigDecimal.ZERO;
            throw new BankingOperationException(
                "24-Hour ATM withdrawal limit of ₹" + String.format("%,.2f", maxDaily) + " exceeded! Total withdrawn in last 24 hours: ₹" + 
                String.format("%,.2f", existing24hWithdrawals) + ". Remaining limit today: ₹" + String.format("%,.2f", remaining)
            );
        }

        if (debitCard != null) {
            if (debitCard.getStatus() != CardStatus.ACTIVE) {
                throw new BankingOperationException("ATM Card is " + debitCard.getStatus() + ". Only active cards can be used for withdrawals.");
            }
            if (debitCard.getPinHash() != null) {
                if (!passwordEncoder.matches(pin, debitCard.getPinHash())) {
                    throw new InvalidTransactionPinException("Incorrect 4-Digit ATM PIN for card " + debitCard.getMaskedCardNumber());
                }
            } else {
                authService.validateCustomerPin(customer, pin);
            }
        } else {
            authService.validateCustomerPin(customer, pin);
        }

        // Check Balance
        if (account.getBalance().compareTo(req.getAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient balance! Available balance is ₹" + account.getBalance());
        }

        BigDecimal oldBalance = account.getBalance();
        BigDecimal newBalance = oldBalance.subtract(req.getAmount());
        account.setBalance(newBalance);
        account.setLedgerBalance(account.getLedgerBalance().subtract(req.getAmount()));
        accountRepository.save(account);

        TransactionType txnType = transactionTypeRepository.findByCode("WITHDRAWAL")
                .orElseGet(() -> transactionTypeRepository.save(TransactionType.builder().code("WITHDRAWAL").name("Cash / ATM Withdrawal").build()));

        String txnRef = referenceGenerator.generateTransactionRef();
        String desc = req.getDescription() != null && !req.getDescription().isEmpty()
                ? req.getDescription()
                : (debitCard != null ? "ATM Cash Withdrawal (" + debitCard.getMaskedCardNumber() + ")" : "ATM Cash Withdrawal");

        Transaction txn = Transaction.builder()
                .transactionRef(txnRef)
                .fromAccount(account)
                .transactionType(txnType)
                .amount(req.getAmount())
                .balanceAfter(newBalance)
                .senderBalanceAfter(newBalance)
                .description(desc)
                .status(TransactionStatus.SUCCESS)
                .build();
        txn = transactionRepository.save(txn);

        auditLogService.logAction(customer.getUser().getId(), username,
                "ROLE_CUSTOMER", "WITHDRAWAL", "Account", account.getAccountNumber(), ipAddress, "SUCCESS",
                "Withdrawn ₹" + req.getAmount() + " from " + account.getAccountNumber() + ". Balance After: ₹" + newBalance + (debitCard != null ? " [ATM Card: " + debitCard.getMaskedCardNumber() + "]" : ""));

        notificationService.createNotification(customer, "Account Debited",
                "₹" + req.getAmount() + " has been debited from your account " + account.getAccountNumber() + ". Available Balance: ₹" + newBalance + " (Ref: " + txnRef + ")",
                NotificationType.WITHDRAWAL);

        return mapToTransactionResponse(txn, account.getAccountNumber());
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TransactionResponse cashierWithdraw(WithdrawRequest req, String cashierUsername, String ipAddress) {
        Account account = accountRepository.findByAccountNumberForUpdate(req.getAccountNumber())
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + req.getAccountNumber()));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountSuspendedException("Cannot withdraw from account with status: " + account.getStatus());
        }

        BigDecimal maxPerTxn = BigDecimal.valueOf(200000);
        if (req.getAmount().compareTo(maxPerTxn) > 0) {
            throw new BankingOperationException("Cashier counter withdrawal cannot exceed ₹2,00,000 per transaction!");
        }

        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        BigDecimal existing24hWithdrawals = transactionRepository.sumWithdrawalsForAccountSince(account.getId(), twentyFourHoursAgo);
        BigDecimal maxDaily = BigDecimal.valueOf(500000);

        if (existing24hWithdrawals.add(req.getAmount()).compareTo(maxDaily) > 0) {
            BigDecimal remaining = maxDaily.subtract(existing24hWithdrawals);
            if (remaining.compareTo(BigDecimal.ZERO) < 0) remaining = BigDecimal.ZERO;
            throw new BankingOperationException(
                "24-Hour cashier counter withdrawal restriction of ₹5,00,000 exceeded for account " + account.getAccountNumber() + 
                "! Total withdrawn at counter in last 24 hours: ₹" + String.format("%,.2f", existing24hWithdrawals) + 
                ". Remaining limit: ₹" + String.format("%,.2f", remaining)
            );
        }

        // Check Balance
        if (account.getBalance().compareTo(req.getAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient balance! Available balance is ₹" + account.getBalance());
        }

        BigDecimal oldBalance = account.getBalance();
        BigDecimal newBalance = oldBalance.subtract(req.getAmount());
        account.setBalance(newBalance);
        account.setLedgerBalance(account.getLedgerBalance().subtract(req.getAmount()));
        accountRepository.save(account);

        TransactionType txnType = transactionTypeRepository.findByCode("WITHDRAWAL")
                .orElseGet(() -> transactionTypeRepository.save(TransactionType.builder().code("WITHDRAWAL").name("Cash / ATM Withdrawal").build()));

        String txnRef = referenceGenerator.generateTransactionRef();
        Transaction txn = Transaction.builder()
                .transactionRef(txnRef)
                .fromAccount(account)
                .transactionType(txnType)
                .amount(req.getAmount())
                .balanceAfter(newBalance)
                .senderBalanceAfter(newBalance)
                .description(req.getDescription() != null && !req.getDescription().isEmpty() ? req.getDescription() : "Cashier Counter Cash Withdrawal")
                .status(TransactionStatus.SUCCESS)
                .build();
        txn = transactionRepository.save(txn);

        Customer customer = account.getCustomer();
        auditLogService.logAction(customer.getUser().getId(), cashierUsername,
                "ROLE_EMPLOYEE_CASHIER", "CASHIER_WITHDRAWAL", "Account", account.getAccountNumber(), ipAddress, "SUCCESS",
                "Teller " + cashierUsername + " dispensed cash ₹" + req.getAmount() + " from " + account.getAccountNumber() + ". Balance After: ₹" + newBalance);

        notificationService.createNotification(customer, "Counter Cash Withdrawal",
                "₹" + req.getAmount() + " was withdrawn at the Branch Cashier Counter from " + account.getAccountNumber() + ". Balance: ₹" + newBalance + " (Ref: " + txnRef + ")",
                NotificationType.WITHDRAWAL);

        return mapToTransactionResponse(txn, account.getAccountNumber());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getRecentTransactions(String accountNumber) {
        Pageable pageable = PageRequest.of(0, 10);
        return transactionRepository.findRecentByAccountNumber(accountNumber, pageable).stream()
                .map(t -> mapToTransactionResponse(t, accountNumber))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PagedResponse<TransactionResponse> getFilteredTransactions(String username, TransactionFilterRequest filter) {
        int page = filter.getPage() != null ? filter.getPage() : 0;
        int size = filter.getSize() != null ? filter.getSize() : 20;
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Transaction> pageResult = transactionRepository.findAllByCustomerUsername(username, pageable);

        List<TransactionResponse> responses = pageResult.getContent().stream()
                .map(t -> mapToTransactionResponse(t, filter.getAccountNumber()))
                .collect(Collectors.toList());

        return PagedResponse.<TransactionResponse>builder()
                .content(responses)
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public StatementSummaryResponse getStatementData(String accountNumber, String timeframe, LocalDate customStart, LocalDate customEnd, String username) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountNumber));

        if (username != null && !account.getCustomer().getUser().getUsername().equals(username)) {
            throw new AccountSuspendedException("Access Denied: You do not own this account");
        }

        LocalDate endDate = customEnd != null ? customEnd : LocalDate.now();
        LocalDate startDate = customStart != null ? customStart : endDate.minusMonths(6);

        if (timeframe != null && !timeframe.equalsIgnoreCase("CUSTOM")) {
            switch (timeframe.toUpperCase()) {
                case "7_DAYS":
                    startDate = endDate.minusDays(7);
                    break;
                case "30_DAYS":
                    startDate = endDate.minusDays(30);
                    break;
                case "3_MONTHS":
                    startDate = endDate.minusMonths(3);
                    break;
                case "6_MONTHS":
                default:
                    startDate = endDate.minusMonths(6);
                    break;
            }
        }

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<Transaction> transactions = transactionRepository.findStatementTransactions(accountNumber, startDateTime, endDateTime);

        BigDecimal totalDebits = BigDecimal.ZERO;
        BigDecimal totalCredits = BigDecimal.ZERO;

        List<TransactionResponse> txResponses = transactions.stream()
                .map(t -> mapToTransactionResponse(t, accountNumber))
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .collect(Collectors.toList());

        for (TransactionResponse r : txResponses) {
            if ("DEBIT".equalsIgnoreCase(r.getEntryType())) {
                totalDebits = totalDebits.add(r.getAmount());
            } else {
                totalCredits = totalCredits.add(r.getAmount());
            }
        }

        // Opening balance calculation approx
        BigDecimal closingBalance = account.getBalance();
        BigDecimal openingBalance = closingBalance.subtract(totalCredits).add(totalDebits);

        return StatementSummaryResponse.builder()
                .bankName("Godavari Bank (Simulated)")
                .branchName(account.getBranchName())
                .ifscCode(account.getIfscCode())
                .customerName(account.getCustomer().getFullName())
                .customerId(account.getCustomer().getCustomerId())
                .accountNumber(account.getAccountNumber())
                .accountType(account.getAccountType().getName())
                .address(account.getCustomer().getAddress() + ", " + account.getCustomer().getCity() + ", " + account.getCustomer().getPincode())
                .startDate(startDate)
                .endDate(endDate)
                .openingBalance(openingBalance)
                .closingBalance(closingBalance)
                .totalDebits(totalDebits)
                .totalCredits(totalCredits)
                .transactionCount(transactions.size())
                .transactions(txResponses)
                .build();
    }

    public byte[] exportStatementPdf(String accountNumber, String timeframe, LocalDate customStart, LocalDate customEnd, String username) {
        StatementSummaryResponse statement = getStatementData(accountNumber, timeframe, customStart, customEnd, username);
        return pdfStatementGenerator.generateStatementPdf(statement);
    }

    public byte[] exportStatementCsv(String accountNumber, String timeframe, LocalDate customStart, LocalDate customEnd, String username) {
        StatementSummaryResponse statement = getStatementData(accountNumber, timeframe, customStart, customEnd, username);
        return csvStatementGenerator.generateStatementCsv(statement);
    }

    public TransactionResponse mapToTransactionResponse(Transaction t, String focusAccountNumber) {
        String entryType = "UNKNOWN";
        BigDecimal balanceAfterForFocus = t.getBalanceAfter();

        if (focusAccountNumber != null) {
            if (t.getFromAccount() != null && focusAccountNumber.equals(t.getFromAccount().getAccountNumber())) {
                entryType = "DEBIT";
                balanceAfterForFocus = t.getSenderBalanceAfter() != null ? t.getSenderBalanceAfter() : t.getBalanceAfter();
            } else if (t.getToAccount() != null && focusAccountNumber.equals(t.getToAccount().getAccountNumber())) {
                entryType = "CREDIT";
                if (t.getReceiverBalanceAfter() != null) {
                    balanceAfterForFocus = t.getReceiverBalanceAfter();
                } else if (t.getFromAccount() == null) {
                    balanceAfterForFocus = t.getBalanceAfter();
                } else if (t.getToAccount() != null && t.getToAccount().getBalance() != null) {
                    balanceAfterForFocus = t.getToAccount().getBalance();
                }
            }
        } else {
            entryType = t.getFromAccount() != null ? "DEBIT" : "CREDIT";
        }

        return TransactionResponse.builder()
                .id(t.getId())
                .transactionRef(t.getTransactionRef())
                .fromAccountNumber(t.getFromAccount() != null ? t.getFromAccount().getAccountNumber() : null)
                .fromCustomerName(t.getFromAccount() != null && t.getFromAccount().getCustomer() != null ? t.getFromAccount().getCustomer().getFullName() : null)
                .toAccountNumber(t.getToAccount() != null ? t.getToAccount().getAccountNumber() : null)
                .toCustomerName(t.getToAccount() != null && t.getToAccount().getCustomer() != null ? t.getToAccount().getCustomer().getFullName() : null)
                .transactionType(t.getTransactionType().getCode())
                .transactionTypeName(t.getTransactionType().getName())
                .amount(t.getAmount())
                .balanceAfter(balanceAfterForFocus)
                .description(t.getDescription())
                .status(t.getStatus().name())
                .entryType(entryType)
                .createdAt(t.getCreatedAt())
                .build();
    }
}
