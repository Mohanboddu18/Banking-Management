package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.ChequeBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChequeBookRepository extends JpaRepository<ChequeBook, Long> {
    Optional<ChequeBook> findByChequeBookNumber(String chequeBookNumber);
    List<ChequeBook> findAllByAccount_Customer_User_Username(String username);
}
