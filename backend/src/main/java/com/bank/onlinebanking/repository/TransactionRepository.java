package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    Optional<Transaction> findByTransactionRef(String transactionRef);

    @Query("SELECT t FROM Transaction t " +
           "LEFT JOIN t.fromAccount fa " +
           "LEFT JOIN t.toAccount ta " +
           "WHERE (fa.accountNumber = :accountNo OR ta.accountNumber = :accountNo) " +
           "ORDER BY t.createdAt DESC")
    List<Transaction> findRecentByAccountNumber(@Param("accountNo") String accountNo, Pageable pageable);

    @Query("SELECT t FROM Transaction t " +
           "LEFT JOIN t.fromAccount fa " +
           "LEFT JOIN t.toAccount ta " +
           "WHERE (fa.accountNumber = :accountNo OR ta.accountNumber = :accountNo) " +
           "AND t.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY t.createdAt DESC")
    List<Transaction> findStatementTransactions(@Param("accountNo") String accountNo,
                                                @Param("startDate") LocalDateTime startDate,
                                                @Param("endDate") LocalDateTime endDate);

    @Query("SELECT t FROM Transaction t " +
           "LEFT JOIN t.fromAccount fa " +
           "LEFT JOIN t.toAccount ta " +
           "LEFT JOIN fa.customer fc " +
           "LEFT JOIN fc.user fcu " +
           "LEFT JOIN ta.customer tc " +
           "LEFT JOIN tc.user tcu " +
           "WHERE (fcu.username = :username OR tcu.username = :username) " +
           "ORDER BY t.createdAt DESC")
    Page<Transaction> findAllByCustomerUsername(@Param("username") String username, Pageable pageable);

    @Query("SELECT t FROM Transaction t " +
           "LEFT JOIN t.fromAccount fa " +
           "LEFT JOIN t.toAccount ta " +
           "LEFT JOIN fa.customer fc " +
           "LEFT JOIN fc.user fcu " +
           "LEFT JOIN ta.customer tc " +
           "LEFT JOIN tc.user tcu " +
           "WHERE (fcu.username = :username OR tcu.username = :username) " +
           "AND t.createdAt >= :cutoffDate " +
           "ORDER BY t.createdAt DESC")
    List<Transaction> findCustomerTransactionsSince(@Param("username") String username, @Param("cutoffDate") LocalDateTime cutoffDate);

    boolean existsByIdempotencyKey(String idempotencyKey);
}
