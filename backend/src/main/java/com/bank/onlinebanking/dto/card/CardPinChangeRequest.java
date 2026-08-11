package com.bank.onlinebanking.dto.card;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CardPinChangeRequest {
    @NotBlank(message = "New Card PIN is required")
    @Pattern(regexp = "^\\d{4}$", message = "Card PIN must be 4 digits")
    private String newPin;

    @NotBlank(message = "Confirm PIN is required")
    private String confirmPin;
}
