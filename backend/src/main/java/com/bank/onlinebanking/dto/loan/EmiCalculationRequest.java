package com.bank.onlinebanking.dto.loan;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class EmiCalculationRequest {
    @NotNull(message = "Principal amount is required")
    @DecimalMin(value = "1000.00", message = "Principal must be at least ₹1000")
    private BigDecimal principal;

    @NotNull(message = "Interest rate is required")
    @DecimalMin(value = "1.00", message = "Interest rate must be at least 1%")
    private BigDecimal annualInterestRate;

    @NotNull(message = "Tenure is required")
    @Min(value = 1, message = "Minimum tenure is 1 month")
    @Max(value = 360, message = "Maximum tenure is 360 months")
    private Integer tenureMonths;
}
