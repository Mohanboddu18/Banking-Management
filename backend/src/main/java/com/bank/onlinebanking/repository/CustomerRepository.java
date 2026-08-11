package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByCustomerId(String customerId);
    Optional<Customer> findByUser_Username(String username);
    Optional<Customer> findByUser_Email(String email);
    Optional<Customer> findByPanNumber(String panNumber);
    Optional<Customer> findByAadhaarNumber(String aadhaarNumber);
    boolean existsByPanNumber(String panNumber);
    boolean existsByAadhaarNumber(String aadhaarNumber);
}
