package com.bank.onlinebanking.dto.transaction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponse {
    private Long id;
    private String transactionRef;
    private String fromAccountNumber;
    private String fromCustomerName;
    private String toAccountNumber;
    private String toCustomerName;
    private String transactionType;
    private String transactionTypeName;
    private BigDecimal amount;
    private BigDecimal balanceAfter;
    private String description;
    private String status;
    private String entryType; // "DEBIT" or "CREDIT" from customer's perspective
    private LocalDateTime createdAt;
}
