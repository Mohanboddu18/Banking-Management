package com.bank.onlinebanking.entity;

import com.bank.onlinebanking.entity.enums.CardStatus;
import com.bank.onlinebanking.entity.enums.CardType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cards", indexes = {
        @Index(name = "idx_card_number", columnList = "cardNumber", unique = true),
        @Index(name = "idx_card_account", columnList = "account_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DebitCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id", nullable = false)
    @JsonIgnoreProperties({"customer", "balance", "ledgerBalance"})
    private Account account;

    @Column(nullable = false, unique = true, length = 20)
    private String cardNumber;

    @Column(nullable = false, length = 25)
    private String maskedCardNumber; // "XXXX-XXXX-XXXX-1234"

    @Column(nullable = false, length = 100)
    private String cardHolderName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CardType cardType;

    @Column(nullable = false)
    private int expiryMonth;

    @Column(nullable = false)
    private int expiryYear;

    @JsonIgnore
    @Column(nullable = false, length = 120)
    private String cvvHash;

    @JsonIgnore
    @Column(length = 120)
    private String pinHash;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal dailyLimit = BigDecimal.valueOf(40000.00);

    @Column(nullable = false)
    @Builder.Default
    private boolean internationalUsage = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean contactlessPayment = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CardStatus status = CardStatus.ACTIVE;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
