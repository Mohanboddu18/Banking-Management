package com.bank.onlinebanking.controller;

import com.bank.onlinebanking.dto.cheque.*;
import com.bank.onlinebanking.dto.common.ApiResponse;
import com.bank.onlinebanking.service.ChequeService;
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
@RequestMapping("/api/cheques")
@RequiredArgsConstructor
@Tag(name = "Cheque Book Management", description = "Endpoints for Cheque Book Requests and Issuance")
public class ChequeController {

    private final ChequeService chequeService;

    @PostMapping("/request")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Request Cheque Book (25/50/100 Leaves)")
    public ResponseEntity<ApiResponse<ChequeBookResponse>> requestChequeBook(@Valid @RequestBody ChequeRequestDTO req, Authentication authentication) {
        ChequeBookResponse response = chequeService.requestChequeBook(authentication.getName(), req);
        return new ResponseEntity<>(ApiResponse.ok(response, "Cheque book request submitted successfully!"), HttpStatus.CREATED);
    }

    @GetMapping("/my-requests")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Get Customer Cheque Book Requests")
    public ResponseEntity<ApiResponse<List<ChequeBookResponse>>> getMyChequeRequests(Authentication authentication) {
        List<ChequeBookResponse> list = chequeService.getCustomerChequeRequests(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_EMPLOYEE_OPERATIONS', 'ROLE_EMPLOYEE_ASST_MANAGER', 'ROLE_ADMIN')")
    @Operation(summary = "Get Pending Cheque Requests for Bank Staff")
    public ResponseEntity<ApiResponse<List<ChequeBookResponse>>> getPendingCheques() {
        List<ChequeBookResponse> list = chequeService.getAllPendingChequeRequests();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PutMapping("/{requestId}/process")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_EMPLOYEE_OPERATIONS', 'ROLE_EMPLOYEE_ASST_MANAGER', 'ROLE_ADMIN')")
    @Operation(summary = "Approve or Reject Cheque Book Request")
    public ResponseEntity<ApiResponse<ChequeBookResponse>> processCheque(@PathVariable Long requestId, @Valid @RequestBody ChequeRequestProcessDTO req, Authentication authentication) {
        ChequeBookResponse response = chequeService.processChequeRequest(requestId, authentication.getName(), req);
        return ResponseEntity.ok(ApiResponse.ok(response, "Cheque request processed successfully!"));
    }
}
