package com.bank.onlinebanking.dto.vas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieBookingResponse {
    private Long id;
    private String bookingRef;
    private String movieTitle;
    private String language;
    private String theatreName;
    private String cityName;
    private String screenName;
    private LocalDate showDate;
    private LocalTime showTime;
    private int totalSeats;
    private String seatNumbers;
    private BigDecimal totalAmount;
    private String transactionRef;
    private String status;
    private LocalDateTime bookingTime;
}
