package com.bank.onlinebanking.dto.loan;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmiCalculationResponse {
    private BigDecimal principal;
    private BigDecimal annualInterestRate;
    private int tenureMonths;
    private BigDecimal monthlyEmi;
    private BigDecimal totalInterest;
    private BigDecimal totalPayable;
    private List<AmortizationScheduleItem> schedule;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AmortizationScheduleItem {
        private int month;
        private BigDecimal emi;
        private BigDecimal principal;
        private BigDecimal interest;
        private BigDecimal balance;
    }
}
