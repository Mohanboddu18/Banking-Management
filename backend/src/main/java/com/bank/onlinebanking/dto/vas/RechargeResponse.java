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
public class RechargeResponse {
    private String transactionRef;
    private String mobileNumber;
    private String operatorName;
    private String planName;
    private BigDecimal amount;
    private String status;
    private LocalDateTime timestamp;
}
