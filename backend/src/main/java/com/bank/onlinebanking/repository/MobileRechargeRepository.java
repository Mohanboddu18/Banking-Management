package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.MobileRecharge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MobileRechargeRepository extends JpaRepository<MobileRecharge, Long> {
    List<MobileRecharge> findAllByCustomer_User_UsernameOrderByCreatedAtDesc(String username);
}
