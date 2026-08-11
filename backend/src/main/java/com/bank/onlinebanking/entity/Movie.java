package com.bank.onlinebanking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "movies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, length = 60)
    private String genre; // "Action / Sci-Fi", "Thriller / Drama", etc.

    @Column(nullable = false)
    private int durationMinutes;

    @Column(nullable = false, length = 30)
    private String language; // "Hindi", "English", "Telugu", "Tamil"

    @Column(length = 500)
    private String posterUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private double rating; // e.g. 8.8

    @Column
    private LocalDate releaseDate;
}
