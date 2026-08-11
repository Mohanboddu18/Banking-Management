package com.bank.onlinebanking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "locations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String cityName; // e.g. "Mumbai", "Delhi NCR", "Bengaluru", "Hyderabad", "Vijayawada"

    @Column(nullable = false, length = 60)
    private String stateName;
}
