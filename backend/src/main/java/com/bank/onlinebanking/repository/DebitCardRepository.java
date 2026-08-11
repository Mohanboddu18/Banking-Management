package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.DebitCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DebitCardRepository extends JpaRepository<DebitCard, Long> {
    Optional<DebitCard> findByCardNumber(String cardNumber);
    List<DebitCard> findAllByAccount_Customer_User_Username(String username);
    List<DebitCard> findAllByAccount_Id(Long accountId);
}
