package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShowRepository extends JpaRepository<Show, Long> {
    List<Show> findAllByMovie_Id(Long movieId);
    List<Show> findAllByMovie_IdAndShowDateGreaterThanEqual(Long movieId, LocalDate date);
    List<Show> findAllByScreen_Theatre_Location_CityName(String cityName);
}
