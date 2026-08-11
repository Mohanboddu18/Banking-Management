package com.bank.onlinebanking.dto.employee;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeResponse {
    private Long id;
    private Long userId;
    private String employeeId;
    private String username;
    private String fullName;
    private String email;
    private String mobile;
    private String roleDesignation;
    private String roleName;
    private String department;
    private LocalDate joiningDate;
    private String status;
    private boolean enabled;
    private LocalDateTime createdAt;
}
