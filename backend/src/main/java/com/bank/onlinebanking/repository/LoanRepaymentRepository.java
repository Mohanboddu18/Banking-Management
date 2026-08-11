package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.LoanRepayment;
import com.bank.onlinebanking.entity.enums.RepaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LoanRepaymentRepository extends JpaRepository<LoanRepayment, Long> {
    List<LoanRepayment> findAllByLoan_IdOrderByInstallmentNumberAsc(Long loanId);
    List<LoanRepayment> findAllByLoan_Customer_User_Username(String username);
    List<LoanRepayment> findAllByStatusAndDueDateLessThanEqual(RepaymentStatus status, LocalDate date);
}
