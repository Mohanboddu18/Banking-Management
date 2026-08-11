package com.bank.onlinebanking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "transaction_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String code; // "DEPOSIT", "WITHDRAWAL", "P2P_TRANSFER", "QR_PAYMENT", "CARD_PAYMENT", "MOBILE_RECHARGE", "MOVIE_BOOKING", "LOAN_DISBURSEMENT", "EMI_PAYMENT", "BANK_CHARGE", "REFUND"

    @Column(nullable = false, length = 100)
    private String name;
}
