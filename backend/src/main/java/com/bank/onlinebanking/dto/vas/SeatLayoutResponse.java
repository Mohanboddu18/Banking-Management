package com.bank.onlinebanking.dto.vas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatLayoutResponse {
    private Long showId;
    private String movieTitle;
    private String theatreName;
    private String screenName;
    private BigDecimal ticketPrice;
    private int totalRows;
    private int totalCols;
    private List<SeatDetail> seats;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SeatDetail {
        private Long seatId;
        private String rowLabel;
        private int colNumber;
        private String seatCode;
        private String seatType;
        private BigDecimal price;
        private boolean isBooked;
    }
}
