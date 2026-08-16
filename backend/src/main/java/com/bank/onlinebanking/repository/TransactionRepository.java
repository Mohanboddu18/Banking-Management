package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
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

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.toAccount.id = :accountId " +
           "AND t.transactionType.code = 'DEPOSIT' " +
           "AND (LOWER(t.description) LIKE '%atm%' OR LOWER(t.description) LIKE '%card%') " +
           "AND t.status = com.bank.onlinebanking.entity.enums.TransactionStatus.SUCCESS " +
           "AND t.createdAt >= :since")
    BigDecimal sumAtmCardDepositsForAccountSince(@Param("accountId") Long accountId, @Param("since") LocalDateTime since);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.toAccount.id = :accountId " +
           "AND t.transactionType.code = 'DEPOSIT' " +
           "AND t.status = com.bank.onlinebanking.entity.enums.TransactionStatus.SUCCESS " +
           "AND t.createdAt >= :since")
    BigDecimal sumDepositsForAccountSince(@Param("accountId") Long accountId, @Param("since") LocalDateTime since);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.fromAccount.id = :accountId " +
           "AND t.transactionType.code = 'WITHDRAWAL' " +
           "AND t.status = com.bank.onlinebanking.entity.enums.TransactionStatus.SUCCESS " +
           "AND t.createdAt >= :since")
    BigDecimal sumWithdrawalsForAccountSince(@Param("accountId") Long accountId, @Param("since") LocalDateTime since);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.fromAccount.id = :accountId " +
           "AND t.transactionType.code IN ('P2P_TRANSFER', 'QR_PAYMENT', 'CARD_PAYMENT', 'MOBILE_RECHARGE') " +
           "AND t.status = com.bank.onlinebanking.entity.enums.TransactionStatus.SUCCESS " +
           "AND t.createdAt >= :since")
    BigDecimal sumTransfersForAccountSince(@Param("accountId") Long accountId, @Param("since") LocalDateTime since);

    boolean existsByIdempotencyKey(String idempotencyKey);
}
