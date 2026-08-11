package com.bank.onlinebanking.entity;

import com.bank.onlinebanking.entity.enums.CardStatus;
import com.bank.onlinebanking.entity.enums.CardType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_cards", indexes = {
        @Index(name = "idx_credit_card_num", columnList = "cardNumber", unique = true),
        @Index(name = "idx_credit_card_cust", columnList = "customer_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnoreProperties({"accounts", "user"})
    private Customer customer;

    @Column(nullable = false, unique = true, length = 20)
    private String cardNumber;

    @Column(nullable = false, length = 25)
    private String maskedCardNumber; // "XXXX-XXXX-XXXX-5678"

    @Column(nullable = false, length = 100)
    private String cardHolderName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CardType cardType;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal creditLimit;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal availableCredit;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal usedCredit = BigDecimal.ZERO;

    @Column(nullable = false)
    private int billingCycleDay; // e.g. 15th of every month

    @Column
    private LocalDate paymentDueDate;

    @Column(nullable = false)
    private int expiryMonth;

    @Column(nullable = false)
    private int expiryYear;

    @JsonIgnore
    @Column(nullable = false, length = 120)
    private String cvvHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CardStatus status = CardStatus.ACTIVE;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
