package com.bank.onlinebanking.dto.employee;

import lombok.Data;

@Data
public class EmployeeUpdateRequest {
    private String fullName;
    private String email;
    private String mobile;
    private String roleName;
    private String department;
    private String status; // "ACTIVE" or "INACTIVE"
    private Boolean enabled;
}
