package com.bank.onlinebanking.entity;

import com.bank.onlinebanking.entity.enums.ChequeStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "cheque_books", indexes = {
        @Index(name = "idx_cheque_book_account", columnList = "account_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChequeBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id", nullable = false)
    @JsonIgnoreProperties({"customer", "balance", "ledgerBalance"})
    private Account account;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    private ChequeBookRequest request;

    @Column(nullable = false, unique = true, length = 30)
    private String chequeBookNumber;

    @Column(nullable = false)
    private long startLeafNumber;

    @Column(nullable = false)
    private long endLeafNumber;

    @Column(nullable = false)
    private int totalLeaves;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime issuedDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ChequeStatus status = ChequeStatus.ACTIVE;
}
