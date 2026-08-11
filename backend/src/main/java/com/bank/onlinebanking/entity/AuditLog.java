package com.bank.onlinebanking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_user", columnList = "username"),
        @Index(name = "idx_audit_action", columnList = "action"),
        @Index(name = "idx_audit_created", columnList = "createdAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50)
    private Long userId;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 40)
    private String role;

    @Column(nullable = false, length = 60)
    private String action; // e.g. "LOGIN", "TRANSFER", "WITHDRAWAL", "LOAN_APPROVED", "CARD_BLOCKED"

    @Column(nullable = false, length = 50)
    private String entityName; // e.g. "Account", "Loan", "Card", "Complaint"

    @Column(length = 50)
    private String entityId;

    @Column(length = 50)
    private String ipAddress;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "SUCCESS"; // "SUCCESS", "FAILED"

    @Column(columnDefinition = "TEXT")
    private String details;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
