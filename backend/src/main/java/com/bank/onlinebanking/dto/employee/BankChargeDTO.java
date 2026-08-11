package com.bank.onlinebanking.dto.employee;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankChargeDTO {
    private Long id;

    @NotBlank(message = "Charge name is required")
    private String chargeName;

    @NotBlank(message = "Charge type is required")
    private String chargeType;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.00", message = "Amount cannot be negative")
    private BigDecimal amount;

    private Long accountTypeId;
    private String accountTypeCode;

    private BigDecimal minBalanceThreshold;
    private String frequency; // "MONTHLY", "ANNUAL", "PER_TRANSACTION"
    private boolean active;
    private LocalDateTime createdAt;
}
