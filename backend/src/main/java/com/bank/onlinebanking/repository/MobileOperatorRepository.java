package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.MobileOperator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MobileOperatorRepository extends JpaRepository<MobileOperator, Long> {
    Optional<MobileOperator> findByName(String name);
}
