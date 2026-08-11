package com.bank.onlinebanking.controller;

import com.bank.onlinebanking.dto.common.ApiResponse;
import com.bank.onlinebanking.dto.common.PagedResponse;
import com.bank.onlinebanking.dto.transaction.*;
import com.bank.onlinebanking.service.TransactionService;
import com.bank.onlinebanking.service.TransferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions & Fund Transfers", description = "Endpoints for Deposits, Withdrawals, P2P Transfers, History, and Statements")
public class TransactionController {

    private final TransactionService transactionService;
    private final TransferService transferService;

    @PostMapping("/deposit")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Deposit Money", description = "Deposits money into specified account.")
    public ResponseEntity<ApiResponse<TransactionResponse>> deposit(@Valid @RequestBody DepositRequest req, Authentication authentication, HttpServletRequest servletReq) {
        String ip = servletReq.getRemoteAddr();
        TransactionResponse response = transactionService.deposit(req, authentication.getName(), ip);
        return ResponseEntity.ok(ApiResponse.ok(response, "Deposit successful!"));
    }

    @PostMapping("/withdraw")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Withdraw Money", description = "Withdraws money from customer account after PIN validation.")
    public ResponseEntity<ApiResponse<TransactionResponse>> withdraw(@Valid @RequestBody WithdrawRequest req, Authentication authentication, HttpServletRequest servletReq) {
        String ip = servletReq.getRemoteAddr();
        TransactionResponse response = transactionService.withdraw(req, authentication.getName(), ip);
        return ResponseEntity.ok(ApiResponse.ok(response, "Withdrawal successful!"));
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "P2P Fund Transfer", description = "Atomically transfers funds between accounts with PIN & Idempotency protection.")
    public ResponseEntity<ApiResponse<TransactionResponse>> transfer(
            @Valid @RequestBody P2PTransferRequest req,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            Authentication authentication,
            HttpServletRequest servletReq) {
        String ip = servletReq.getRemoteAddr();
        TransactionResponse response = transferService.executeP2PTransfer(req, authentication.getName(), idempotencyKey, ip);
        return ResponseEntity.ok(ApiResponse.ok(response, "Transfer completed successfully!"));
    }

    @GetMapping("/recent")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Get Recent Transactions", description = "Retrieves recent 10 transactions for dashboard.")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getRecentTransactions(@RequestParam String accountNumber) {
        List<TransactionResponse> recent = transactionService.getRecentTransactions(accountNumber);
        return ResponseEntity.ok(ApiResponse.ok(recent));
    }

    @PostMapping("/history")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Search & Filter Transactions", description = "Retrieves paginated transactions with date range, category, and credit/debit filters.")
    public ResponseEntity<ApiResponse<PagedResponse<TransactionResponse>>> getFilteredHistory(
            @RequestBody TransactionFilterRequest filter,
            Authentication authentication) {
        PagedResponse<TransactionResponse> result = transactionService.getFilteredTransactions(authentication.getName(), filter);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/statement/data")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Get Statement Summary Data", description = "Retrieves statement overview with opening/closing balances.")
    public ResponseEntity<ApiResponse<StatementSummaryResponse>> getStatementData(
            @RequestParam String accountNumber,
            @RequestParam(required = false, defaultValue = "6_MONTHS") String timeframe,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        StatementSummaryResponse response = transactionService.getStatementData(accountNumber, timeframe, startDate, endDate, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/statement/pdf")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Download Statement PDF", description = "Exports professional bank statement PDF.")
    public ResponseEntity<byte[]> downloadPdfStatement(
            @RequestParam String accountNumber,
            @RequestParam(required = false, defaultValue = "6_MONTHS") String timeframe,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        byte[] pdfBytes = transactionService.exportStatementPdf(accountNumber, timeframe, startDate, endDate, authentication.getName());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Bank_Statement_" + accountNumber + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/statement/csv")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Download Statement CSV", description = "Exports transaction records in CSV format.")
    public ResponseEntity<byte[]> downloadCsvStatement(
            @RequestParam String accountNumber,
            @RequestParam(required = false, defaultValue = "6_MONTHS") String timeframe,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        byte[] csvBytes = transactionService.exportStatementCsv(accountNumber, timeframe, startDate, endDate, authentication.getName());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Bank_Statement_" + accountNumber + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
}
