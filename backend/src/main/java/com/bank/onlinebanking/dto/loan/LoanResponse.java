package com.bank.onlinebanking.dto.loan;

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
public class LoanResponse {
    private Long id;
    private String loanAccountNumber;
    private String customerId;
    private String customerName;
    private String loanTypeCode;
    private String loanTypeName;
    private BigDecimal requestedAmount;
    private BigDecimal approvedAmount;
    private BigDecimal interestRate;
    private int tenureMonths;
    private BigDecimal monthlyEmi;
    private BigDecimal totalInterest;
    private BigDecimal totalPayable;
    private BigDecimal remainingPrincipal;
    private int remainingEmis;
    private String employmentType;
    private BigDecimal monthlyIncome;
    private String purpose;
    private String status;
    private String officerRecommendation;
    private String rejectionReason;
    private LocalDateTime appliedDate;
    private LocalDateTime approvedDate;
}
