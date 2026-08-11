package com.bank.onlinebanking.dto.vas;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.List;

@Data
public class MovieBookingRequest {

    @NotNull(message = "Show ID is required")
    private Long showId;

    @NotNull(message = "Account number is required")
    private String accountNumber;

    @NotEmpty(message = "At least one seat must be selected")
    private List<Long> seatIds;

    @NotNull(message = "Transaction PIN is required")
    @Pattern(regexp = "^\\d{4,6}$", message = "PIN must be 4 to 6 numeric digits")
    private String transactionPin;
}
