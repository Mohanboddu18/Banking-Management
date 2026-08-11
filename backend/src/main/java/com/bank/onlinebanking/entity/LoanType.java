package com.bank.onlinebanking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "loan_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code; // "PERSONAL", "HOME", "EDUCATION", "VEHICLE"

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal interestRate; // e.g. 10.50%

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal minAmount;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal maxAmount;

    @Column(nullable = false)
    private int minTenureMonths;

    @Column(nullable = false)
    private int maxTenureMonths;

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal processingFeePercent = BigDecimal.valueOf(1.00);
}
