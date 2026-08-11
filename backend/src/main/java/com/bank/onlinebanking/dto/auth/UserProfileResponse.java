package com.bank.onlinebanking.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private Long userId;
    private String username;
    private String email;
    private String mobile;
    private String userType;
    private List<String> roles;
    private boolean isPinSet;

    // Customer fields
    private String customerId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String gender;
    private LocalDate dateOfBirth;
    private String panNumber;
    private String maskedAadhaar;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String occupation;
    private BigDecimal annualIncome;
    private String nomineeName;
    private String nomineeRelation;

    // Employee fields
    private String employeeId;
    private String roleDesignation;
    private String department;
    private LocalDate joiningDate;

    private LocalDateTime createdAt;
}
