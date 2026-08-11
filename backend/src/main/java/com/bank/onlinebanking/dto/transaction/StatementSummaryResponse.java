package com.bank.onlinebanking.dto.transaction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatementSummaryResponse {
    private String bankName;
    private String branchName;
    private String ifscCode;
    private String customerName;
    private String customerId;
    private String accountNumber;
    private String accountType;
    private String address;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal openingBalance;
    private BigDecimal closingBalance;
    private BigDecimal totalDebits;
    private BigDecimal totalCredits;
    private int transactionCount;
    private List<TransactionResponse> transactions;
}
