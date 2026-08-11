package com.bank.onlinebanking.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "merchants", indexes = {
        @Index(name = "idx_merchant_code", columnList = "merchantCode", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Merchant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String merchantCode; // e.g. MERCH001

    @Column(nullable = false, length = 100)
    private String businessName;

    @Column(nullable = false, length = 100)
    private String ownerName;

    @Column(nullable = false, length = 15)
    private String mobile;

    @Column(nullable = false, length = 100)
    private String email;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "settlement_account_id", nullable = false)
    @JsonIgnoreProperties({"customer", "balance", "ledgerBalance"})
    private Account settlementAccount;

    @Column(nullable = false, length = 50)
    private String category; // "Restaurant", "Retail", "Groceries", "Electronics"

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
