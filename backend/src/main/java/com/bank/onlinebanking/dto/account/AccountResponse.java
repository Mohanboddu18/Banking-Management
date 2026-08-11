package com.bank.onlinebanking.dto.account;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountResponse {
    private Long id;
    private String accountNumber;
    private String customerId;
    private String customerName;
    private String accountType; // "SAVINGS", "CURRENT"
    private String accountTypeName;
    private BigDecimal balance;
    private BigDecimal ledgerBalance;
    private BigDecimal minBalance;
    private BigDecimal interestRate;
    private BigDecimal dailyTransferLimit;
    private String status;
    private String ifscCode;
    private String branchName;
    private LocalDate openingDate;
    private LocalDateTime createdAt;
}
