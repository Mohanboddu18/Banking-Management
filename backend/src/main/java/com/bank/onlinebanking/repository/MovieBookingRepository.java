package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.MovieBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieBookingRepository extends JpaRepository<MovieBooking, Long> {
    Optional<MovieBooking> findByBookingRef(String bookingRef);
    List<MovieBooking> findAllByCustomer_User_UsernameOrderByCreatedAtDesc(String username);
}
