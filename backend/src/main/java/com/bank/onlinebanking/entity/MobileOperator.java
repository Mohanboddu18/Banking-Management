package com.bank.onlinebanking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mobile_operators")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MobileOperator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name; // "Airtel", "Jio", "Vi", "BSNL"

    @Column(length = 50)
    private String circle; // "All India", "Maharashtra & Goa", "Delhi NCR", "Andhra Pradesh"

    @Column(length = 255)
    private String logoUrl;

    @OneToMany(mappedBy = "operator", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private List<MobileRechargePlan> plans = new ArrayList<>();
}
