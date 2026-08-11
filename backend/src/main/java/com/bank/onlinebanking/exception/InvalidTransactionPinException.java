package com.bank.onlinebanking.exception;

public class InvalidTransactionPinException extends RuntimeException {
    public InvalidTransactionPinException(String message) {
        super(message);
    }
}
