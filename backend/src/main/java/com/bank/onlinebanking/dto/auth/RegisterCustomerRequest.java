package com.bank.onlinebanking.dto.auth;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class RegisterCustomerRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 40, message = "Username must be between 3 and 40 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 4, max = 60, message = "Password must be at least 4 characters")
    private String password;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Mobile number is required")
    private String mobile;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String gender;

    private LocalDate dateOfBirth;

    @NotBlank(message = "PAN Number is required")
    private String panNumber;

    private String aadhaarNumber;

    private String address;

    private String city;

    private String state;

    private String pincode;

    private String occupation;

    private BigDecimal annualIncome;

    private String nomineeName;

    private String nomineeRelation;

    private String accountType; // "SAVINGS" or "CURRENT"

    private BigDecimal initialDeposit;

    @NotBlank(message = "Transaction PIN is required")
    @Pattern(regexp = "^\\d{4,6}$", message = "Transaction PIN must be 4 to 6 numeric digits")
    private String transactionPin;
}
