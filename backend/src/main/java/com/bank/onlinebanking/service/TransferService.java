package com.bank.onlinebanking.service;

import com.bank.onlinebanking.dto.transaction.P2PTransferRequest;
import com.bank.onlinebanking.dto.transaction.TransactionResponse;
import com.bank.onlinebanking.entity.*;
import com.bank.onlinebanking.entity.enums.AccountStatus;
import com.bank.onlinebanking.entity.enums.NotificationType;
import com.bank.onlinebanking.entity.enums.TransactionStatus;
import com.bank.onlinebanking.exception.AccountNotFoundException;
import com.bank.onlinebanking.exception.AccountSuspendedException;
import com.bank.onlinebanking.exception.BankingOperationException;
import com.bank.onlinebanking.exception.InsufficientBalanceException;
import com.bank.onlinebanking.repository.*;
import com.bank.onlinebanking.util.ReferenceGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class TransferService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionTypeRepository transactionTypeRepository;
    private final AuthService authService;
    private final ReferenceGenerator referenceGenerator;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final IdempotencyService idempotencyService;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TransactionResponse executeP2PTransfer(P2PTransferRequest req, String username, String idempotencyKey, String ipAddress) {
        // 1. Idempotency Check
        idempotencyService.validateKey(idempotencyKey, username, "/api/transactions/transfer");

        if (req.getSenderAccountNumber().equals(req.getReceiverAccountNumber())) {
            throw new BankingOperationException("Sender and Recipient account numbers cannot be identical!");
        }

        // 2. Fetch Accounts
        Account senderAccount = accountRepository.findByAccountNumber(req.getSenderAccountNumber())
                .orElseThrow(() -> new AccountNotFoundException("Sender account not found: " + req.getSenderAccountNumber()));

        Account receiverAccount = accountRepository.findByAccountNumber(req.getReceiverAccountNumber())
                .orElseThrow(() -> new AccountNotFoundException("Receiver account not found: " + req.getReceiverAccountNumber()));

        // 3. Ownership and Status Validations
        Customer sender = senderAccount.getCustomer();
        if (username != null && !sender.getUser().getUsername().equals(username)) {
            throw new AccountSuspendedException("Access Denied: You do not own the sender account");
        }

        if (senderAccount.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountSuspendedException("Sender account is " + senderAccount.getStatus() + ". Transfers are disabled.");
        }
        if (receiverAccount.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountSuspendedException("Receiver account is " + receiverAccount.getStatus() + ". Cannot transfer funds.");
        }

        // 4. Validate Transaction PIN
        authService.validateCustomerPin(sender, req.getTransactionPin());

        // 5. Deadlock-free sorted locking
        Account firstLock;
        Account secondLock;
        if (senderAccount.getId() < receiverAccount.getId()) {
            firstLock = accountRepository.findByIdForUpdate(senderAccount.getId()).orElseThrow();
            secondLock = accountRepository.findByIdForUpdate(receiverAccount.getId()).orElseThrow();
        } else {
            firstLock = accountRepository.findByIdForUpdate(receiverAccount.getId()).orElseThrow();
            secondLock = accountRepository.findByIdForUpdate(senderAccount.getId()).orElseThrow();
        }

        Account lockedSender = firstLock.getId().equals(senderAccount.getId()) ? firstLock : secondLock;
        Account lockedReceiver = firstLock.getId().equals(receiverAccount.getId()) ? firstLock : secondLock;

        // 6. Limits & Balance Verification
        BigDecimal maxPerTxn = BigDecimal.valueOf(100000);
        if (req.getAmount().compareTo(maxPerTxn) > 0) {
            throw new BankingOperationException("Single P2P fund transfer cannot exceed ₹1,00,000 (1 Lakh) per transaction!");
        }

        java.time.LocalDateTime twentyFourHoursAgo = java.time.LocalDateTime.now().minusHours(24);
        BigDecimal existing24hTransfers = transactionRepository.sumTransfersForAccountSince(lockedSender.getId(), twentyFourHoursAgo);
        BigDecimal dailyLimit = lockedSender.getAccountType() != null && lockedSender.getAccountType().getDailyTransferLimit() != null
                ? lockedSender.getAccountType().getDailyTransferLimit()
                : BigDecimal.valueOf(100000);

        if (existing24hTransfers.add(req.getAmount()).compareTo(dailyLimit) > 0) {
            BigDecimal remaining = dailyLimit.subtract(existing24hTransfers);
            if (remaining.compareTo(BigDecimal.ZERO) < 0) remaining = BigDecimal.ZERO;
            throw new BankingOperationException(
                "24-Hour daily transfer limit of ₹" + String.format("%,.2f", dailyLimit) + " exceeded for account " + lockedSender.getAccountNumber() + 
                "! Total transferred in last 24 hours: ₹" + String.format("%,.2f", existing24hTransfers) + 
                ". Remaining limit today: ₹" + String.format("%,.2f", remaining)
            );
        }

        if (lockedSender.getBalance().compareTo(req.getAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient funds! Your available balance is ₹" + lockedSender.getBalance());
        }

        // 7. Atomic Balance Updates
        BigDecimal senderNewBalance = lockedSender.getBalance().subtract(req.getAmount());
        lockedSender.setBalance(senderNewBalance);
        lockedSender.setLedgerBalance(lockedSender.getLedgerBalance().subtract(req.getAmount()));
        accountRepository.save(lockedSender);

        BigDecimal receiverNewBalance = lockedReceiver.getBalance().add(req.getAmount());
        lockedReceiver.setBalance(receiverNewBalance);
        lockedReceiver.setLedgerBalance(lockedReceiver.getLedgerBalance().add(req.getAmount()));
        accountRepository.save(lockedReceiver);

        // 8. Transaction Record
        TransactionType txnType = transactionTypeRepository.findByCode("P2P_TRANSFER")
                .orElseGet(() -> transactionTypeRepository.save(TransactionType.builder().code("P2P_TRANSFER").name("Person-to-Person Transfer").build()));

        String txnRef = referenceGenerator.generateTransactionRef();
        String desc = req.getDescription() != null && !req.getDescription().isEmpty()
                ? req.getDescription()
                : "Transfer to " + lockedReceiver.getCustomer().getFullName() + " (" + lockedReceiver.getAccountNumber() + ")";

        Transaction txn = Transaction.builder()
                .transactionRef(txnRef)
                .fromAccount(lockedSender)
                .toAccount(lockedReceiver)
                .transactionType(txnType)
                .amount(req.getAmount())
                .balanceAfter(senderNewBalance)
                .senderBalanceAfter(senderNewBalance)
                .receiverBalanceAfter(receiverNewBalance)
                .description(desc)
                .status(TransactionStatus.SUCCESS)
                .idempotencyKey(idempotencyKey)
                .build();
        txn = transactionRepository.save(txn);

        // 9. Audit Log
        auditLogService.logAction(sender.getUser().getId(), username, "ROLE_CUSTOMER", "P2P_TRANSFER",
                "Transaction", txnRef, ipAddress, "SUCCESS",
                "Transferred ₹" + req.getAmount() + " from " + lockedSender.getAccountNumber() + " to " + lockedReceiver.getAccountNumber());

        // 10. Dual Notifications
        notificationService.createNotification(sender, "Funds Transferred",
                "₹" + req.getAmount() + " successfully transferred to " + lockedReceiver.getCustomer().getFullName() + " (" + lockedReceiver.getAccountNumber() + "). Balance: ₹" + senderNewBalance + " (Ref: " + txnRef + ")",
                NotificationType.TRANSFER);

        notificationService.createNotification(lockedReceiver.getCustomer(), "Funds Received",
                "₹" + req.getAmount() + " received from " + sender.getFullName() + " (" + lockedSender.getAccountNumber() + "). Available Balance: ₹" + receiverNewBalance + " (Ref: " + txnRef + ")",
                NotificationType.TRANSFER);

        return TransactionResponse.builder()
                .id(txn.getId())
                .transactionRef(txn.getTransactionRef())
                .fromAccountNumber(lockedSender.getAccountNumber())
                .fromCustomerName(sender.getFullName())
                .toAccountNumber(lockedReceiver.getAccountNumber())
                .toCustomerName(lockedReceiver.getCustomer().getFullName())
                .transactionType("P2P_TRANSFER")
                .transactionTypeName("Person-to-Person Transfer")
                .amount(req.getAmount())
                .balanceAfter(senderNewBalance)
                .description(desc)
                .status("SUCCESS")
                .entryType("DEBIT")
                .createdAt(txn.getCreatedAt())
                .build();
    }
}
