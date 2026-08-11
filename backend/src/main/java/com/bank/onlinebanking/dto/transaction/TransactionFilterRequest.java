package com.bank.onlinebanking.dto.transaction;

import lombok.Data;

import java.time.LocalDate;

@Data
public class TransactionFilterRequest {
    private String accountNumber;
    private String timeframe; // "7_DAYS", "30_DAYS", "3_MONTHS", "6_MONTHS", "CUSTOM"
    private LocalDate startDate;
    private LocalDate endDate;
    private String transactionType;
    private String entryType; // "DEBIT", "CREDIT", "ALL"
    private Integer page = 0;
    private Integer size = 20;
}
