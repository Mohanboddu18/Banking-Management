package com.bank.onlinebanking.dto.loan;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class EmiPaymentRequest {
    @NotBlank(message = "Debiting account number is required")
    private String accountNumber;

    @NotBlank(message = "Transaction PIN is required")
    @Pattern(regexp = "^\\d{4,6}$", message = "PIN must be 4 to 6 digits")
    private String transactionPin;
}
