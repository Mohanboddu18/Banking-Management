package com.bank.onlinebanking.dto.cheque;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChequeRequestProcessDTO {
    @NotBlank(message = "Action is required (APPROVE or REJECT)")
    private String action; // "APPROVE" or "REJECT"

    private String remarks;
}
