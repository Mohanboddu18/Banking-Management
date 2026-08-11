package com.bank.onlinebanking.dto.card;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DebitCardRequest {
    @NotBlank(message = "Account number is required")
    private String accountNumber;

    @NotBlank(message = "Card type is required (e.g. RUPAY_GLOBAL_DEBIT, VISA_PLATINUM_DEBIT)")
    private String cardType;

    private String nameOnCard;
}
