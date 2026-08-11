package com.bank.onlinebanking.entity;

import com.bank.onlinebanking.entity.enums.LoanStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "loans", indexes = {
        @Index(name = "idx_loan_account_num", columnList = "loanAccountNumber", unique = true),
        @Index(name = "idx_loan_customer", columnList = "customer_id"),
        @Index(name = "idx_loan_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnoreProperties({"accounts", "user"})
    private Customer customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "loan_type_id", nullable = false)
    private LoanType loanType;

    @Column(nullable = false, unique = true, length = 40)
    private String loanAccountNumber; // e.g. LN202608110001

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal requestedAmount;

    @Column(precision = 15, scale = 2)
    private BigDecimal approvedAmount;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(nullable = false)
    private int tenureMonths;

    @Column(precision = 15, scale = 2)
    private BigDecimal monthlyEmi;

    @Column(precision = 15, scale = 2)
    private BigDecimal totalInterest;

    @Column(precision = 15, scale = 2)
    private BigDecimal totalPayable;

    @Column(precision = 15, scale = 2)
    private BigDecimal remainingPrincipal;

    @Column(nullable = false)
    private int remainingEmis;

    @Column(nullable = false, length = 50)
    private String employmentType; // "Salaried", "Self-Employed", "Business"

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal monthlyIncome;

    @Column(nullable = false, length = 255)
    private String purpose;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private LoanStatus status = LoanStatus.APPLIED;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime appliedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_id")
    private Employee reviewedBy; // Loan Officer

    @Column(length = 255)
    private String officerRecommendation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_id")
    private Employee approvedBy; // Bank Manager

    @Column
    private LocalDateTime approvedDate;

    @Column(length = 255)
    private String rejectionReason;

    @OneToMany(mappedBy = "loan", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<LoanRepayment> repayments = new ArrayList<>();

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
