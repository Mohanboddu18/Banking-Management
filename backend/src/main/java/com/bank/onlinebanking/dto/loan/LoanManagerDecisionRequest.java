package com.bank.onlinebanking.dto.loan;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LoanManagerDecisionRequest {
    @NotBlank(message = "Decision is required (APPROVE or REJECT)")
    private String decision; // "APPROVE" or "REJECT"

    private BigDecimal approvedAmount; // Can adjust sanction amount

    private String remarks;
}
