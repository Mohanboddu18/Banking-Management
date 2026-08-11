package com.bank.onlinebanking.entity;

import com.bank.onlinebanking.entity.enums.SeatType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seats", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"screen_id", "rowLabel", "colNumber"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screen_id", nullable = false)
    @JsonIgnore
    private Screen screen;

    @Column(nullable = false, length = 5)
    private String rowLabel; // "A", "B", "C", "D", "E", "F"

    @Column(nullable = false)
    private int colNumber; // 1 to 10

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SeatType seatType = SeatType.STANDARD;

    public String getSeatCode() {
        return rowLabel + colNumber;
    }
}
