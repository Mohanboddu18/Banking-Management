package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {
    List<Beneficiary> findAllByCustomer_User_Username(String username);
    Optional<Beneficiary> findByCustomer_IdAndAccountNumber(Long customerId, String accountNumber);
}
