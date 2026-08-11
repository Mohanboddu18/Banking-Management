package com.bank.onlinebanking.util;

import com.bank.onlinebanking.dto.loan.EmiCalculationResponse;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Component
public class AmortizationCalculator {

    public BigDecimal calculateMonthlyEmi(BigDecimal principal, BigDecimal annualRatePercent, int tenureMonths) {
        if (principal == null || annualRatePercent == null || tenureMonths <= 0) {
            return BigDecimal.ZERO;
        }

        // Monthly interest rate = Annual Rate / (12 * 100)
        double monthlyRate = annualRatePercent.doubleValue() / (12.0 * 100.0);
        double p = principal.doubleValue();

        if (monthlyRate == 0) {
            return principal.divide(BigDecimal.valueOf(tenureMonths), 2, RoundingMode.HALF_UP);
        }

        // EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]
        double emi = (p * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
                     (Math.pow(1 + monthlyRate, tenureMonths) - 1);

        return BigDecimal.valueOf(emi).setScale(2, RoundingMode.HALF_UP);
    }

    public EmiCalculationResponse generateAmortizationSchedule(BigDecimal principal, BigDecimal annualRatePercent, int tenureMonths) {
        BigDecimal monthlyEmi = calculateMonthlyEmi(principal, annualRatePercent, tenureMonths);
        BigDecimal totalPayable = monthlyEmi.multiply(BigDecimal.valueOf(tenureMonths));
        BigDecimal totalInterest = totalPayable.subtract(principal);

        double monthlyRate = annualRatePercent.doubleValue() / (12.0 * 100.0);
        BigDecimal remainingBalance = principal;
        List<EmiCalculationResponse.AmortizationScheduleItem> schedule = new ArrayList<>();

        for (int m = 1; m <= tenureMonths; m++) {
            BigDecimal interest = remainingBalance.multiply(BigDecimal.valueOf(monthlyRate)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal principalPaid = monthlyEmi.subtract(interest);

            if (m == tenureMonths) {
                // Adjust rounding difference in the last month
                principalPaid = remainingBalance;
                remainingBalance = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
            } else {
                remainingBalance = remainingBalance.subtract(principalPaid).setScale(2, RoundingMode.HALF_UP);
            }

            schedule.add(EmiCalculationResponse.AmortizationScheduleItem.builder()
                    .month(m)
                    .emi(monthlyEmi)
                    .principal(principalPaid)
                    .interest(interest)
                    .balance(remainingBalance)
                    .build());
        }

        return EmiCalculationResponse.builder()
                .principal(principal)
                .annualInterestRate(annualRatePercent)
                .tenureMonths(tenureMonths)
                .monthlyEmi(monthlyEmi)
                .totalInterest(totalInterest)
                .totalPayable(totalPayable)
                .schedule(schedule)
                .build();
    }
}
