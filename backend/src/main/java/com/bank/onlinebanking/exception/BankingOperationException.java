package com.bank.onlinebanking.exception;

public class BankingOperationException extends RuntimeException {
    public BankingOperationException(String message) {
        super(message);
    }
}
