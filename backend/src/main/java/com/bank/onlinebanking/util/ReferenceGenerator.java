package com.bank.onlinebanking.util;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class ReferenceGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final AtomicLong SEQUENCE = new AtomicLong(1000);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    public String generateAccountNumber() {
        // e.g. SBIN0001 + 8 digits
        long randomNum = 10000000L + (long)(RANDOM.nextDouble() * 89999999L);
        return "SBIN0001" + randomNum;
    }

    public String generateCustomerId() {
        return "CUST" + (100000 + RANDOM.nextInt(900000));
    }

    public String generateEmployeeId(int seq) {
        return String.format("EMP%03d", seq);
    }

    public String generateTransactionRef() {
        String datePart = LocalDateTime.now().format(DATE_FORMATTER);
        long seq = SEQUENCE.incrementAndGet() % 100000;
        int randomSuffix = 100 + RANDOM.nextInt(900);
        return String.format("TXN%s%05d%d", datePart, seq, randomSuffix);
    }

    public String generateLoanAccountNumber() {
        String datePart = LocalDateTime.now().format(DATE_FORMATTER);
        int randomNum = 1000 + RANDOM.nextInt(9000);
        return "LN" + datePart + randomNum;
    }

    public String generateChequeBookNumber() {
        String datePart = LocalDateTime.now().format(DATE_FORMATTER);
        int randomNum = 1000 + RANDOM.nextInt(9000);
        return "CHQ" + datePart + randomNum;
    }

    public String generateComplaintTicket() {
        String datePart = LocalDateTime.now().format(DATE_FORMATTER);
        int randomNum = 1000 + RANDOM.nextInt(9000);
        return "TKT" + datePart + randomNum;
    }

    public String generateBookingRef() {
        String datePart = LocalDateTime.now().format(DATE_FORMATTER);
        int randomNum = 1000 + RANDOM.nextInt(9000);
        return "BK" + datePart + randomNum;
    }

    public String generateCardNumber(String binPrefix) {
        StringBuilder sb = new StringBuilder(binPrefix != null ? binPrefix : "4532");
        while (sb.length() < 16) {
            sb.append(RANDOM.nextInt(10));
        }
        return sb.toString();
    }

    public String maskCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 4) return "XXXX-XXXX-XXXX-0000";
        String last4 = cardNumber.substring(cardNumber.length() - 4);
        return "XXXX-XXXX-XXXX-" + last4;
    }

    public String generateCvv() {
        return String.format("%03d", RANDOM.nextInt(1000));
    }
}
