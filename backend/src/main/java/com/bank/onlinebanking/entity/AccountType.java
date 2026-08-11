package com.bank.onlinebanking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "account_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code; // "SAVINGS", "CURRENT", "SALARY"

    @Column(nullable = false, length = 60)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal minBalance = BigDecimal.valueOf(3000.00);

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal interestRate = BigDecimal.valueOf(3.50);

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal dailyTransferLimit = BigDecimal.valueOf(100000.00);
}
