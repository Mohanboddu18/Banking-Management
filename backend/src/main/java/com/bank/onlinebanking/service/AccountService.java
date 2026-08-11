package com.bank.onlinebanking.service;

import com.bank.onlinebanking.dto.account.*;
import com.bank.onlinebanking.entity.*;
import com.bank.onlinebanking.entity.enums.AccountStatus;
import com.bank.onlinebanking.exception.AccountNotFoundException;
import com.bank.onlinebanking.exception.BankingOperationException;
import com.bank.onlinebanking.exception.ResourceNotFoundException;
import com.bank.onlinebanking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final BeneficiaryRepository beneficiaryRepository;

    @Transactional(readOnly = true)
    public List<AccountResponse> getCustomerAccounts(String username) {
        return accountRepository.findAllByCustomer_User_Username(username).stream()
                .map(this::mapToAccountResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AccountResponse getAccountByNumber(String accountNumber, String username) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountNumber));

        if (username != null && !account.getCustomer().getUser().getUsername().equals(username)) {
            throw new BankingOperationException("Access Denied: Account does not belong to user " + username);
        }

        return mapToAccountResponse(account);
    }

    @Transactional(readOnly = true)
    public BalanceResponse getAccountBalance(String accountNumber, String username) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountNumber));

        if (username != null && !account.getCustomer().getUser().getUsername().equals(username)) {
            throw new BankingOperationException("Access Denied: Account does not belong to user " + username);
        }

        return BalanceResponse.builder()
                .accountNumber(account.getAccountNumber())
                .accountType(account.getAccountType().getName())
                .availableBalance(account.getBalance())
                .ledgerBalance(account.getLedgerBalance())
                .minBalanceRequirement(account.getAccountType().getMinBalance())
                .status(account.getStatus().name())
                .ifscCode(account.getIfscCode())
                .build();
    }

    @Transactional(readOnly = true)
    public List<BeneficiaryResponse> getBeneficiaries(String username) {
        return beneficiaryRepository.findAllByCustomer_User_Username(username).stream()
                .map(this::mapToBeneficiaryResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BeneficiaryResponse addBeneficiary(String username, BeneficiaryRequest req) {
        Customer customer = customerRepository.findByUser_Username(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + username));

        if (beneficiaryRepository.findByCustomer_IdAndAccountNumber(customer.getId(), req.getAccountNumber()).isPresent()) {
            throw new BankingOperationException("Beneficiary with this account number is already saved!");
        }

        Beneficiary beneficiary = Beneficiary.builder()
                .customer(customer)
                .beneficiaryName(req.getBeneficiaryName())
                .accountNumber(req.getAccountNumber())
                .ifscCode(req.getIfscCode().toUpperCase())
                .bankName(req.getBankName())
                .maxLimit(req.getMaxLimit())
                .build();

        beneficiary = beneficiaryRepository.save(beneficiary);
        return mapToBeneficiaryResponse(beneficiary);
    }

    @Transactional
    public void deleteBeneficiary(String username, Long beneficiaryId) {
        Beneficiary beneficiary = beneficiaryRepository.findById(beneficiaryId)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found"));

        if (!beneficiary.getCustomer().getUser().getUsername().equals(username)) {
            throw new BankingOperationException("Beneficiary does not belong to user: " + username);
        }

        beneficiaryRepository.delete(beneficiary);
    }

    public AccountResponse mapToAccountResponse(Account acc) {
        return AccountResponse.builder()
                .id(acc.getId())
                .accountNumber(acc.getAccountNumber())
                .customerId(acc.getCustomer().getCustomerId())
                .customerName(acc.getCustomer().getFullName())
                .accountType(acc.getAccountType().getCode())
                .accountTypeName(acc.getAccountType().getName())
                .balance(acc.getBalance())
                .ledgerBalance(acc.getLedgerBalance())
                .minBalance(acc.getAccountType().getMinBalance())
                .interestRate(acc.getAccountType().getInterestRate())
                .dailyTransferLimit(acc.getAccountType().getDailyTransferLimit())
                .status(acc.getStatus().name())
                .ifscCode(acc.getIfscCode())
                .branchName(acc.getBranchName())
                .openingDate(acc.getOpeningDate())
                .createdAt(acc.getCreatedAt())
                .build();
    }

    private BeneficiaryResponse mapToBeneficiaryResponse(Beneficiary b) {
        return BeneficiaryResponse.builder()
                .id(b.getId())
                .beneficiaryName(b.getBeneficiaryName())
                .accountNumber(b.getAccountNumber())
                .ifscCode(b.getIfscCode())
                .bankName(b.getBankName())
                .maxLimit(b.getMaxLimit())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
