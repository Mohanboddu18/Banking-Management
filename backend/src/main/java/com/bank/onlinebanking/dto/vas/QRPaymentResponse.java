package com.bank.onlinebanking.dto.vas;

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
public class QRPaymentResponse {
    private String transactionRef;
    private String merchantName;
    private String merchantCode;
    private String merchantCategory;
    private BigDecimal amount;
    private BigDecimal remainingBalance;
    private String status;
    private LocalDateTime timestamp;
}
