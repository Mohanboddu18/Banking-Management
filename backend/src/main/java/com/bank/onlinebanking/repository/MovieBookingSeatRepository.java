package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.MovieBookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieBookingSeatRepository extends JpaRepository<MovieBookingSeat, Long> {

    @Query("SELECT mbs FROM MovieBookingSeat mbs WHERE mbs.booking.show.id = :showId AND mbs.booking.status = 'CONFIRMED'")
    List<MovieBookingSeat> findBookedSeatsForShow(@Param("showId") Long showId);
}
