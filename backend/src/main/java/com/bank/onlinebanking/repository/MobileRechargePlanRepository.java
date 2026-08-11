package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.MobileRechargePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MobileRechargePlanRepository extends JpaRepository<MobileRechargePlan, Long> {
    List<MobileRechargePlan> findAllByOperator_Id(Long operatorId);
    List<MobileRechargePlan> findAllByOperator_Name(String operatorName);
}
