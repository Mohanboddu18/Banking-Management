package com.bank.onlinebanking.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "screens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Screen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "theatre_id", nullable = false)
    @JsonIgnoreProperties({"location"})
    private Theatre theatre;

    @Column(nullable = false, length = 50)
    private String screenName; // "Audi 1 - Dolby Atmos", "IMAX Screen"

    @Column(nullable = false)
    @Builder.Default
    private int totalRows = 6;

    @Column(nullable = false)
    @Builder.Default
    private int totalCols = 10;
}
