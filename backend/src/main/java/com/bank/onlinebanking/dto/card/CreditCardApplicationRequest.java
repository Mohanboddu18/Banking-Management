package com.bank.onlinebanking.dto.card;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreditCardApplicationRequest {
    @NotBlank(message = "Card type is required")
    private String cardType;

    private String nameOnCard;
}
