package com.bank.onlinebanking.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Username, Account Number or Email is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;
}
