package com.bank.onlinebanking.entity;

import com.bank.onlinebanking.entity.enums.ChargeFrequency;
import com.bank.onlinebanking.entity.enums.ChargeType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bank_charges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankCharge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String chargeName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ChargeType chargeType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_type_id")
    private AccountType accountType;

    @Column(precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal minBalanceThreshold = BigDecimal.valueOf(3000.00);

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ChargeFrequency frequency = ChargeFrequency.MONTHLY;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
