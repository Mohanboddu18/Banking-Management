package com.bank.onlinebanking.dto.transaction;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class P2PTransferRequest {

    @NotBlank(message = "Sender account number is required")
    private String senderAccountNumber;

    @NotBlank(message = "Recipient account number is required")
    private String receiverAccountNumber;

    @NotBlank(message = "Receiver IFSC code is required")
    private String receiverIfscCode;

    @NotNull(message = "Transfer amount is required")
    @DecimalMin(value = "1.00", message = "Minimum transfer amount is ₹1")
    private BigDecimal amount;

    private String description;

    @NotBlank(message = "Transaction PIN is required")
    @Pattern(regexp = "^\\d{4,6}$", message = "PIN must be 4 to 6 numeric digits")
    private String transactionPin;
}
