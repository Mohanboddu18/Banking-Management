package com.bank.onlinebanking.scheduler;

import com.bank.onlinebanking.entity.*;
import com.bank.onlinebanking.entity.enums.AccountStatus;
import com.bank.onlinebanking.entity.enums.ChargeType;
import com.bank.onlinebanking.entity.enums.NotificationType;
import com.bank.onlinebanking.entity.enums.TransactionStatus;
import com.bank.onlinebanking.repository.*;
import com.bank.onlinebanking.service.AuditLogService;
import com.bank.onlinebanking.service.NotificationService;
import com.bank.onlinebanking.util.ReferenceGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BankChargeScheduler {

    private final AccountRepository accountRepository;
    private final BankChargeRepository bankChargeRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionTypeRepository transactionTypeRepository;
    private final ReferenceGenerator referenceGenerator;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    // Run automatically on 1st of every month at midnight, or triggerable manually
    @Scheduled(cron = "0 0 0 1 * ?")
    @Transactional
    public void executeMonthlyBankCharges() {
        log.info("Executing Monthly Minimum Balance & Maintenance Charge Audit...");
        List<BankCharge> activeCharges = bankChargeRepository.findAllByActiveTrue();
        List<Account> activeAccounts = accountRepository.findAllByStatus(AccountStatus.ACTIVE);

        TransactionType chargeType = transactionTypeRepository.findByCode("BANK_CHARGE")
                .orElseGet(() -> transactionTypeRepository.save(TransactionType.builder().code("BANK_CHARGE").name("Bank Maintenance Charge").build()));

        int totalApplied = 0;
        for (Account account : activeAccounts) {
            for (BankCharge charge : activeCharges) {
                if (charge.getChargeType() == ChargeType.MIN_BALANCE_MAINTENANCE) {
                    BigDecimal threshold = charge.getMinBalanceThreshold() != null
                            ? charge.getMinBalanceThreshold()
                            : account.getAccountType().getMinBalance();

                    if (account.getBalance().compareTo(threshold) < 0) {
                        BigDecimal fee = charge.getAmount();
                        BigDecimal newBal = account.getBalance().subtract(fee);
                        account.setBalance(newBal);
                        account.setLedgerBalance(account.getLedgerBalance().subtract(fee));
                        accountRepository.save(account);

                        String txnRef = referenceGenerator.generateTransactionRef();
                        Transaction txn = Transaction.builder()
                                .transactionRef(txnRef)
                                .fromAccount(account)
                                .transactionType(chargeType)
                                .amount(fee)
                                .balanceAfter(newBal)
                                .description("Automatic Deduction: " + charge.getChargeName())
                                .status(TransactionStatus.SUCCESS)
                                .build();
                        transactionRepository.save(txn);

                        notificationService.createNotification(account.getCustomer(), "Bank Maintenance Charge Applied",
                                "₹" + fee + " has been debited from your account " + account.getAccountNumber() + " for not maintaining minimum balance of ₹" + threshold + ". Available Balance: ₹" + newBal + ".",
                                NotificationType.BANK_CHARGE);

                        auditLogService.logAction(account.getCustomer().getUser().getId(), "SYSTEM_SCHEDULER", "SYSTEM",
                                "APPLY_BANK_CHARGE", "Account", account.getAccountNumber(), "127.0.0.1", "SUCCESS",
                                "Applied charge: " + charge.getChargeName() + " (₹" + fee + ")");

                        totalApplied++;
                    }
                }
            }
        }
        log.info("Monthly Bank Charges execution completed. Total charges applied: {}", totalApplied);
    }
}
