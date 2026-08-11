package com.bank.onlinebanking.dto.loan;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoanOfficerReviewRequest {
    @NotBlank(message = "Recommendation is required (e.g. RECOMMENDED_FOR_APPROVAL, RECOMMENDED_FOR_REJECTION)")
    private String recommendation;

    private String notes;
}
