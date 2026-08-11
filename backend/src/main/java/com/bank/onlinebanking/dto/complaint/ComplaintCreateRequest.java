package com.bank.onlinebanking.dto.complaint;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ComplaintCreateRequest {
    @NotBlank(message = "Category is required (e.g. TRANSACTION_ISSUE, CARD_ISSUE, ACCOUNT_ISSUE, LOAN_ISSUE, QR_PAYMENT_ISSUE, RECHARGE_ISSUE, MOVIE_BOOKING_ISSUE, OTHER)")
    private String category;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Description is required")
    private String description;

    private String priority; // "LOW", "MEDIUM", "HIGH", "URGENT"
}
