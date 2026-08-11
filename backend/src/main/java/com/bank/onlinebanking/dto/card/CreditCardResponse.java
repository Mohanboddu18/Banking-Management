package com.bank.onlinebanking.dto.card;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditCardResponse {
    private Long id;
    private String maskedCardNumber;
    private String cardHolderName;
    private String cardType;
    private BigDecimal creditLimit;
    private BigDecimal availableCredit;
    private BigDecimal usedCredit;
    private int billingCycleDay;
    private LocalDate paymentDueDate;
    private int expiryMonth;
    private int expiryYear;
    private String status;
    private LocalDateTime createdAt;
}
