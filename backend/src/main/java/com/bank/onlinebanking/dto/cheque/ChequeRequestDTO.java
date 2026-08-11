package com.bank.onlinebanking.dto.cheque;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChequeRequestDTO {
    @NotBlank(message = "Account number is required")
    private String accountNumber;

    @NotNull(message = "Number of leaves is required")
    @Min(value = 25, message = "Minimum 25 leaves")
    private int numberOfLeaves; // 25, 50, 100
}
