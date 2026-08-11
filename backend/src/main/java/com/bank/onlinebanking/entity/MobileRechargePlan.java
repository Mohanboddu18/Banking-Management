package com.bank.onlinebanking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "mobile_recharge_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MobileRechargePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_id", nullable = false)
    @JsonIgnore
    private MobileOperator operator;

    @Column(nullable = false, length = 100)
    private String planName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private int validityDays;

    @Column(length = 50)
    private String dataQuota; // "1.5 GB/Day", "2 GB/Day", "Unlimited 5G"

    @Column(length = 50)
    private String talktime; // "Truly Unlimited", "₹100 Talktime"

    @Column(length = 255)
    private String description;
}
