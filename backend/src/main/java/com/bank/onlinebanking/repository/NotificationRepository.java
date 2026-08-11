package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByCustomer_User_UsernameOrderByCreatedAtDesc(String username);
    long countByCustomer_User_UsernameAndIsReadFalse(String username);
}
