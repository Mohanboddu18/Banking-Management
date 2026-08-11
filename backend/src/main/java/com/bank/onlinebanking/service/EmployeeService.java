package com.bank.onlinebanking.service;

import com.bank.onlinebanking.dto.account.AccountResponse;
import com.bank.onlinebanking.dto.transaction.DepositRequest;
import com.bank.onlinebanking.dto.transaction.TransactionResponse;
import com.bank.onlinebanking.dto.transaction.WithdrawRequest;
import com.bank.onlinebanking.entity.*;
import com.bank.onlinebanking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final TransactionService transactionService;
    private final AccountService accountService;

    @Transactional(readOnly = true)
    public List<AccountResponse> getAllCustomerAccounts() {
        return accountRepository.findAll().stream()
                .map(accountService::mapToAccountResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> searchAccounts(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllCustomerAccounts();
        }
        String q = query.trim().toLowerCase();
        return accountRepository.findAll().stream()
                .filter(a -> a.getAccountNumber().toLowerCase().contains(q) ||
                             a.getCustomer().getCustomerId().toLowerCase().contains(q) ||
                             a.getCustomer().getFullName().toLowerCase().contains(q) ||
                             a.getCustomer().getPanNumber().toLowerCase().contains(q) ||
                             a.getCustomer().getUser().getMobile().contains(q))
                .map(accountService::mapToAccountResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransactionResponse processCashierDeposit(DepositRequest req, String cashierUsername, String ipAddress) {
        return transactionService.deposit(req, cashierUsername, ipAddress);
    }

    @Transactional
    public TransactionResponse processCashierWithdrawal(WithdrawRequest req, String cashierUsername, String ipAddress) {
        return transactionService.cashierWithdraw(req, cashierUsername, ipAddress);
    }
}
