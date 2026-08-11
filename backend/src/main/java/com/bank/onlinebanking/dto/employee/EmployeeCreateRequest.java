package com.bank.onlinebanking.dto.employee;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EmployeeCreateRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 4, max = 30)
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 40)
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid 10-digit mobile number")
    private String mobile;

    @NotBlank(message = "Role designation is required (e.g. ROLE_EMPLOYEE_CASHIER, ROLE_EMPLOYEE_LOAN_OFFICER, ROLE_EMPLOYEE_CUSTOMER_SERVICE, ROLE_EMPLOYEE_OPERATIONS, ROLE_EMPLOYEE_ASST_MANAGER)")
    private String roleName;

    @NotBlank(message = "Department is required")
    private String department;

    private LocalDate joiningDate;
}
