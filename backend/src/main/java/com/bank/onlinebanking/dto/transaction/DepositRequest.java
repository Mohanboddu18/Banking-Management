package com.bank.onlinebanking.dto.transaction;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DepositRequest {
    @NotBlank(message = "Account number is required")
    private String accountNumber;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "10.00", message = "Minimum deposit amount is ₹10")
    private BigDecimal amount;

    private String description;
    private String depositMethod; // e.g. "ATM_CARD", "DIRECT"
    private String cardNumber;
    private Integer expiryMonth;
    private Integer expiryYear;
    private String cvv;
    private String atmPin;
}

