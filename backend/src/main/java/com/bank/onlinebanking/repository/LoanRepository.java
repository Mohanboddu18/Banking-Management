package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.Loan;
import com.bank.onlinebanking.entity.enums.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    Optional<Loan> findByLoanAccountNumber(String loanAccountNumber);
    List<Loan> findAllByCustomer_User_Username(String username);
    List<Loan> findAllByStatus(LoanStatus status);
    List<Loan> findAllByStatusIn(List<LoanStatus> statuses);
}
