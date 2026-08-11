package com.bank.onlinebanking.dto.card;

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
public class DebitCardResponse {
    private Long id;
    private String accountNumber;
    private String maskedCardNumber;
    private String cardHolderName;
    private String cardType;
    private int expiryMonth;
    private int expiryYear;
    private BigDecimal dailyLimit;
    private boolean internationalUsage;
    private boolean contactlessPayment;
    private String status;
    private LocalDateTime createdAt;
}
