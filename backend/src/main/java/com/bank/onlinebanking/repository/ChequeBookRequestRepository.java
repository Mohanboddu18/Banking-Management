package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.ChequeBookRequest;
import com.bank.onlinebanking.entity.enums.ChequeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChequeBookRequestRepository extends JpaRepository<ChequeBookRequest, Long> {
    List<ChequeBookRequest> findAllByAccount_Customer_User_Username(String username);
    List<ChequeBookRequest> findAllByStatus(ChequeStatus status);
}
