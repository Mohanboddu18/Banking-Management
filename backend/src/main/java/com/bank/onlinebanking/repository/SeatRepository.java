package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findAllByScreen_IdOrderByRowLabelAscColNumberAsc(Long screenId);
}
