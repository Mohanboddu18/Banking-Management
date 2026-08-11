package com.bank.onlinebanking.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SetPinRequest {
    private String currentPin;

    @NotBlank(message = "New PIN is required")
    @Pattern(regexp = "^\\d{4,6}$", message = "PIN must be 4 to 6 numeric digits")
    private String newPin;

    @NotBlank(message = "Confirm PIN is required")
    private String confirmPin;
}
