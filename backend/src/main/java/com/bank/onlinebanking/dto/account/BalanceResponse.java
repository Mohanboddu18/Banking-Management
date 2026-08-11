package com.bank.onlinebanking.dto.account;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BalanceResponse {
    private String accountNumber;
    private String accountType;
    private BigDecimal availableBalance;
    private BigDecimal ledgerBalance;
    private BigDecimal minBalanceRequirement;
    private String status;
    private String ifscCode;
}
