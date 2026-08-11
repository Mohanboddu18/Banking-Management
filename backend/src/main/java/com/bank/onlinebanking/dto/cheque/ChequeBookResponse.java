package com.bank.onlinebanking.dto.cheque;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChequeBookResponse {
    private Long id;
    private Long requestId;
    private String accountNumber;
    private String chequeBookNumber;
    private long startLeafNumber;
    private long endLeafNumber;
    private int totalLeaves;
    private String status;
    private LocalDateTime requestDate;
    private LocalDateTime issuedDate;
}
