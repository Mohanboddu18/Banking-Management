package com.bank.onlinebanking.dto.vas;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RechargeRequest {

    @NotBlank(message = "Account number is required")
    private String accountNumber;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Valid 10-digit mobile number required")
    private String mobileNumber;

    @NotNull(message = "Operator ID is required")
    private Long operatorId;

    @NotBlank(message = "Plan name is required")
    private String planName;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "10.00", message = "Minimum recharge is ₹10")
    private BigDecimal amount;

    @NotBlank(message = "Transaction PIN is required")
    @Pattern(regexp = "^\\d{4,6}$", message = "PIN must be 4 to 6 numeric digits")
    private String transactionPin;
}
