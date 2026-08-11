package com.bank.onlinebanking.dto.vas;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class QRPaymentRequest {

    @NotBlank(message = "Sender account number is required")
    private String accountNumber;

    @NotBlank(message = "QR Payload or Merchant Code is required")
    private String qrPayload;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.00", message = "Minimum payment amount is ₹1")
    private BigDecimal amount;

    private String note;

    @NotBlank(message = "Transaction PIN is required")
    @Pattern(regexp = "^\\d{4,6}$", message = "PIN must be 4 to 6 numeric digits")
    private String transactionPin;
}
