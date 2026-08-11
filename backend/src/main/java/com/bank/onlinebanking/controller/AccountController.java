package com.bank.onlinebanking.controller;

import com.bank.onlinebanking.dto.account.*;
import com.bank.onlinebanking.dto.common.ApiResponse;
import com.bank.onlinebanking.service.AccountService;
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

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts & Beneficiaries", description = "Endpoints for Account Balances, Details, and Beneficiaries")
public class AccountController {

    private final AccountService accountService;

    @GetMapping("/my-accounts")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Get Customer Accounts", description = "Retrieves all bank accounts linked to the authenticated customer.")
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getMyAccounts(Authentication authentication) {
        List<AccountResponse> accounts = accountService.getCustomerAccounts(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(accounts));
    }

    @GetMapping("/{accountNumber}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get Account By Account Number", description = "Retrieves account metadata by account number.")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccountDetails(@PathVariable String accountNumber, Authentication authentication) {
        AccountResponse response = accountService.getAccountByNumber(accountNumber, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{accountNumber}/balance")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Get Account Balance", description = "Retrieves real-time available and ledger balance for an account.")
    public ResponseEntity<ApiResponse<BalanceResponse>> getAccountBalance(@PathVariable String accountNumber, Authentication authentication) {
        BalanceResponse balance = accountService.getAccountBalance(accountNumber, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(balance));
    }

    @GetMapping("/beneficiaries")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Get Saved Beneficiaries", description = "Retrieves customer's saved transfer beneficiaries.")
    public ResponseEntity<ApiResponse<List<BeneficiaryResponse>>> getBeneficiaries(Authentication authentication) {
        List<BeneficiaryResponse> beneficiaries = accountService.getBeneficiaries(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(beneficiaries));
    }

    @PostMapping("/beneficiaries")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Add New Beneficiary", description = "Saves a new transfer beneficiary with account number and IFSC.")
    public ResponseEntity<ApiResponse<BeneficiaryResponse>> addBeneficiary(@Valid @RequestBody BeneficiaryRequest req, Authentication authentication) {
        BeneficiaryResponse response = accountService.addBeneficiary(authentication.getName(), req);
        return new ResponseEntity<>(ApiResponse.ok(response, "Beneficiary added successfully!"), HttpStatus.CREATED);
    }

    @DeleteMapping("/beneficiaries/{id}")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Delete Beneficiary", description = "Removes a saved beneficiary.")
    public ResponseEntity<ApiResponse<String>> deleteBeneficiary(@PathVariable Long id, Authentication authentication) {
        accountService.deleteBeneficiary(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.ok("Beneficiary removed successfully!"));
    }
}
