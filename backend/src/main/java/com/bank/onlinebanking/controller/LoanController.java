package com.bank.onlinebanking.controller;

import com.bank.onlinebanking.dto.common.ApiResponse;
import com.bank.onlinebanking.dto.loan.*;
import com.bank.onlinebanking.dto.transaction.TransactionResponse;
import com.bank.onlinebanking.entity.LoanType;
import com.bank.onlinebanking.service.LoanService;
import com.bank.onlinebanking.util.AmortizationCalculator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
@Tag(name = "Loans & EMI Management", description = "Endpoints for Loan Application, EMI Calculator, Multi-stage Approvals, and EMI Repayments")
public class LoanController {

    private final LoanService loanService;
    private final AmortizationCalculator amortizationCalculator;

    @GetMapping("/types")
    @Operation(summary = "Get All Loan Types & Interest Rates")
    public ResponseEntity<ApiResponse<List<LoanType>>> getLoanTypes() {
        List<LoanType> types = loanService.getAllLoanTypes();
        return ResponseEntity.ok(ApiResponse.ok(types));
    }

    @PostMapping("/calculate-emi")
    @Operation(summary = "Calculate Loan EMI & Amortization Schedule")
    public ResponseEntity<ApiResponse<EmiCalculationResponse>> calculateEmi(@Valid @RequestBody EmiCalculationRequest req) {
        EmiCalculationResponse response = amortizationCalculator.generateAmortizationSchedule(
                req.getPrincipal(), req.getAnnualInterestRate(), req.getTenureMonths());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/apply")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Apply for a Loan (Personal, Home, Vehicle, Education)")
    public ResponseEntity<ApiResponse<LoanResponse>> applyLoan(@Valid @RequestBody LoanApplicationRequest req, Authentication authentication) {
        LoanResponse response = loanService.applyForLoan(authentication.getName(), req);
        return new ResponseEntity<>(ApiResponse.ok(response, "Loan application submitted successfully!"), HttpStatus.CREATED);
    }

    @GetMapping("/my-loans")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Get Customer Active & Applied Loans")
    public ResponseEntity<ApiResponse<List<LoanResponse>>> getMyLoans(Authentication authentication) {
        List<LoanResponse> loans = loanService.getCustomerLoans(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(loans));
    }

    @GetMapping("/{loanId}/repayments")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get EMI Repayment Schedule for Loan")
    public ResponseEntity<ApiResponse<List<LoanRepaymentResponse>>> getRepayments(@PathVariable Long loanId, Authentication authentication) {
        List<LoanRepaymentResponse> schedule = loanService.getLoanRepayments(loanId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(schedule));
    }

    @PostMapping("/{loanId}/pay-emi")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Pay EMI Installment")
    public ResponseEntity<ApiResponse<TransactionResponse>> payEmi(
            @PathVariable Long loanId,
            @Valid @RequestBody EmiPaymentRequest req,
            Authentication authentication,
            HttpServletRequest servletReq) {
        String ip = servletReq.getRemoteAddr();
        TransactionResponse response = loanService.payLoanEmi(loanId, authentication.getName(), req, ip);
        return ResponseEntity.ok(ApiResponse.ok(response, "EMI payment completed successfully!"));
    }

    @PostMapping("/{loanId}/pay-all-emis")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Pay All Remaining EMIs in a Single Settlement Payment")
    public ResponseEntity<ApiResponse<TransactionResponse>> payAllRemainingEmis(
            @PathVariable Long loanId,
            @Valid @RequestBody EmiPaymentRequest req,
            Authentication authentication,
            HttpServletRequest servletReq) {
        String ip = servletReq.getRemoteAddr();
        TransactionResponse response = loanService.payAllRemainingEmis(loanId, authentication.getName(), req, ip);
        return ResponseEntity.ok(ApiResponse.ok(response, "Full loan settlement & closure completed successfully!"));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_EMPLOYEE_LOAN_OFFICER', 'ROLE_EMPLOYEE_ASST_MANAGER', 'ROLE_ADMIN')")
    @Operation(summary = "Get Pending Loans for Review & Approval")
    public ResponseEntity<ApiResponse<List<LoanResponse>>> getPendingLoans() {
        List<LoanResponse> loans = loanService.getPendingLoansForReview();
        return ResponseEntity.ok(ApiResponse.ok(loans));
    }

    @PutMapping("/{loanId}/review")
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYEE_LOAN_OFFICER', 'ROLE_EMPLOYEE_ASST_MANAGER', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    @Operation(summary = "Loan Officer Review & Recommendation")
    public ResponseEntity<ApiResponse<LoanResponse>> reviewLoan(
            @PathVariable Long loanId,
            @Valid @RequestBody LoanOfficerReviewRequest req,
            Authentication authentication) {
        LoanResponse response = loanService.reviewByLoanOfficer(loanId, authentication.getName(), req);
        return ResponseEntity.ok(ApiResponse.ok(response, "Loan review recorded successfully!"));
    }

    @PutMapping("/{loanId}/decision")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    @Operation(summary = "Bank Manager Final Sanction / Rejection & Auto-Disbursement")
    public ResponseEntity<ApiResponse<LoanResponse>> makeManagerDecision(
            @PathVariable Long loanId,
            @Valid @RequestBody LoanManagerDecisionRequest req,
            Authentication authentication) {
        LoanResponse response = loanService.makeManagerDecision(loanId, authentication.getName(), req);
        return ResponseEntity.ok(ApiResponse.ok(response, "Loan decision recorded!"));
    }
}
