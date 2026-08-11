package com.bank.onlinebanking.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ForgotPasswordRequest {

    @NotBlank(message = "Username, Account Number, Mobile, or Email is required")
    private String identifier;

    @NotBlank(message = "New password is required")
    @Size(min = 6, max = 40, message = "Password must be at least 6 characters")
    private String newPassword;

    private String verificationKey; // Optional PIN or PAN verification
}
