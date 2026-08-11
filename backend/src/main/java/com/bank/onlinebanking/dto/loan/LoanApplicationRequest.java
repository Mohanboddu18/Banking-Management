package com.bank.onlinebanking.dto.loan;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LoanApplicationRequest {

    @NotBlank(message = "Loan type is required (e.g. PERSONAL, HOME, EDUCATION, VEHICLE)")
    private String loanTypeCode;

    @NotNull(message = "Requested amount is required")
    @DecimalMin(value = "10000.00", message = "Minimum loan amount is ₹10,000")
    private BigDecimal requestedAmount;

    @NotNull(message = "Tenure is required")
    @Min(value = 6, message = "Minimum tenure is 6 months")
    @Max(value = 360, message = "Maximum tenure is 360 months")
    private Integer tenureMonths;

    @NotBlank(message = "Employment type is required")
    private String employmentType; // "Salaried", "Self-Employed", "Business"

    @NotNull(message = "Monthly income is required")
    @Positive(message = "Monthly income must be positive")
    private BigDecimal monthlyIncome;

    @NotBlank(message = "Purpose of loan is required")
    private String purpose;
}
