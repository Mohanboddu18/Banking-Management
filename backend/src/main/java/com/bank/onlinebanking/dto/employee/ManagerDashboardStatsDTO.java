package com.bank.onlinebanking.dto.employee;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManagerDashboardStatsDTO {
    // Customer Metrics
    private long totalCustomers;
    private long activeAccounts;
    private long suspendedAccounts;
    private long pendingApprovalAccounts;
    private BigDecimal totalBankDeposits;

    // Transaction Metrics
    private long totalTransactions;
    private long todayTransactions;
    private BigDecimal todayCreditVolume;
    private BigDecimal todayDebitVolume;

    // Loan Portfolio
    private long pendingLoanApplications;
    private long activeLoans;
    private BigDecimal totalDisbursedLoanAmount;
    private BigDecimal totalOutstandingLoanAmount;

    // Cards & Cheques
    private long activeDebitCards;
    private long pendingChequeRequests;

    // Support & Complaints
    private long openComplaints;
    private long inProgressComplaints;
    private long resolvedComplaints;

    // Monthly Trends for Charts
    private List<MonthlyTrend> monthlyTrends;
    private Map<String, Long> accountTypeDistribution;
    private Map<String, Long> loanTypeDistribution;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyTrend {
        private String month;
        private BigDecimal deposits;
        private BigDecimal withdrawals;
        private BigDecimal transfers;
    }
}
