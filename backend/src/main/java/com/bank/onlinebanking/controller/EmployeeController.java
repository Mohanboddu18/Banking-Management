package com.bank.onlinebanking.controller;

import com.bank.onlinebanking.dto.account.AccountResponse;
import com.bank.onlinebanking.dto.common.ApiResponse;
import com.bank.onlinebanking.dto.transaction.DepositRequest;
import com.bank.onlinebanking.dto.transaction.TransactionResponse;
import com.bank.onlinebanking.dto.transaction.WithdrawRequest;
import com.bank.onlinebanking.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employee")
@RequiredArgsConstructor
@Tag(name = "Employee Operations", description = "Endpoints for Bank Staff (Cashier, Loan Officer, Support, Operations)")
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping("/customers")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_EMPLOYEE_ASST_MANAGER', 'ROLE_EMPLOYEE_CASHIER', 'ROLE_EMPLOYEE_LOAN_OFFICER', 'ROLE_EMPLOYEE_CUSTOMER_SERVICE', 'ROLE_EMPLOYEE_OPERATIONS', 'ROLE_ADMIN')")
    @Operation(summary = "Search & View All Customer Accounts")
    public ResponseEntity<ApiResponse<List<AccountResponse>>> searchAccounts(@RequestParam(required = false) String query) {
        List<AccountResponse> list = employeeService.searchAccounts(query);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/cashier/deposit")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_EMPLOYEE_CASHIER', 'ROLE_EMPLOYEE_ASST_MANAGER', 'ROLE_ADMIN')")
    @Operation(summary = "Cashier Counter Deposit")
    public ResponseEntity<ApiResponse<TransactionResponse>> cashierDeposit(
            @Valid @RequestBody DepositRequest req,
            Authentication authentication,
            HttpServletRequest servletReq) {
        String ip = servletReq.getRemoteAddr();
        TransactionResponse response = employeeService.processCashierDeposit(req, authentication.getName(), ip);
        return ResponseEntity.ok(ApiResponse.ok(response, "Cashier counter deposit completed successfully!"));
    }

    @PostMapping("/cashier/withdraw")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_EMPLOYEE_CASHIER', 'ROLE_EMPLOYEE_ASST_MANAGER', 'ROLE_ADMIN')")
    @Operation(summary = "Cashier Counter Withdrawal")
    public ResponseEntity<ApiResponse<TransactionResponse>> cashierWithdraw(
            @Valid @RequestBody WithdrawRequest req,
            Authentication authentication,
            HttpServletRequest servletReq) {
        String ip = servletReq.getRemoteAddr();
        TransactionResponse response = employeeService.processCashierWithdrawal(req, authentication.getName(), ip);
        return ResponseEntity.ok(ApiResponse.ok(response, "Cashier counter withdrawal completed successfully!"));
    }
}
