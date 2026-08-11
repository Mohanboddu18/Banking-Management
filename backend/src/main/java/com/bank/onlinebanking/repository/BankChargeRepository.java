package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.BankCharge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BankChargeRepository extends JpaRepository<BankCharge, Long> {
    List<BankCharge> findAllByActiveTrue();
}
