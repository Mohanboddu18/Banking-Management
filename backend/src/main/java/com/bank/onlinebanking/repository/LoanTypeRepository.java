package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.LoanType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoanTypeRepository extends JpaRepository<LoanType, Long> {
    Optional<LoanType> findByCode(String code);
}
