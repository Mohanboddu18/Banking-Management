package com.bank.onlinebanking.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "merchant_qr_codes", indexes = {
        @Index(name = "idx_qr_merchant", columnList = "merchant_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MerchantQrCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "merchant_id", nullable = false)
    @JsonIgnoreProperties({"settlementAccount"})
    private Merchant merchant;

    @Column(nullable = false, unique = true, length = 255)
    private String qrPayload; // e.g. "upi://pay?pa=sbi.merch001@sbi&pn=ABCRestaurant&mc=5812"

    @Column(length = 255)
    private String qrImageUrl;

    @Column(nullable = false)
    @Builder.Default
    private boolean isStatic = true;

    @Column(precision = 15, scale = 2)
    private BigDecimal fixedAmount;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
