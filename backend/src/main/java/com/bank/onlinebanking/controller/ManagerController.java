package com.bank.onlinebanking.controller;

import com.bank.onlinebanking.dto.common.ApiResponse;
import com.bank.onlinebanking.dto.employee.*;
import com.bank.onlinebanking.scheduler.BankChargeScheduler;
import com.bank.onlinebanking.service.AuditLogService;
import com.bank.onlinebanking.service.ManagerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
@Tag(name = "Bank Manager Governance", description = "Endpoints for Bank Manager KPIs, Employee Management, Charge Rules, and Audit Logs")
public class ManagerController {

    private final ManagerService managerService;
    private final AuditLogService auditLogService;
    private final BankChargeScheduler bankChargeScheduler;

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    @Operation(summary = "Get Bank Manager Dashboard KPIs and Chart Analytics")
    public ResponseEntity<ApiResponse<ManagerDashboardStatsDTO>> getDashboardStats() {
        ManagerDashboardStatsDTO stats = managerService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/employees")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    @Operation(summary = "Get All Bank Employees")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getAllEmployees() {
        List<EmployeeResponse> list = managerService.getAllEmployees();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/employees")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    @Operation(summary = "Add / Hire New Bank Employee")
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(
            @Valid @RequestBody EmployeeCreateRequest req,
            Authentication authentication) {
        EmployeeResponse response = managerService.createEmployee(req, authentication.getName());
        return new ResponseEntity<>(ApiResponse.ok(response, "Employee created successfully!"), HttpStatus.CREATED);
    }

    @PutMapping("/employees/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    @Operation(summary = "Update Employee Details / Status")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @PathVariable Long id,
            @RequestBody EmployeeUpdateRequest req,
            Authentication authentication) {
        EmployeeResponse response = managerService.updateEmployee(id, req, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(response, "Employee updated successfully!"));
    }

    @PutMapping("/accounts/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN', 'ROLE_EMPLOYEE_ASST_MANAGER')")
    @Operation(summary = "Activate, Suspend, or Close Customer Account")
    public ResponseEntity<ApiResponse<String>> updateAccountStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String status = body.get("status");
        managerService.updateAccountStatus(id, status, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Account status updated to " + status));
    }

    @GetMapping("/bank-charges")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    @Operation(summary = "Get Configurable Bank Charges & Minimum Balance Rules")
    public ResponseEntity<ApiResponse<List<BankChargeDTO>>> getBankCharges() {
        List<BankChargeDTO> list = managerService.getAllBankCharges();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PutMapping("/bank-charges/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    @Operation(summary = "Update Bank Charge Rule")
    public ResponseEntity<ApiResponse<BankChargeDTO>> updateBankCharge(
            @PathVariable Long id,
            @Valid @RequestBody BankChargeDTO dto,
            Authentication authentication) {
        BankChargeDTO response = managerService.updateBankCharge(id, dto, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(response, "Bank charge rule updated successfully!"));
    }

    @PostMapping("/bank-charges/trigger-scheduler")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    @Operation(summary = "Manually Trigger Monthly Minimum Balance Charge Audit")
    public ResponseEntity<ApiResponse<String>> triggerChargeScheduler() {
        bankChargeScheduler.executeMonthlyBankCharges();
        return ResponseEntity.ok(ApiResponse.ok("Monthly bank charges audit executed successfully!"));
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    @Operation(summary = "Get Live System Audit Logs")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditLogs() {
        List<AuditLogResponse> logs = auditLogService.getRecentAuditLogs();
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }
}
