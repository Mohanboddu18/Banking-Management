package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.Theatre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TheatreRepository extends JpaRepository<Theatre, Long> {
    List<Theatre> findAllByLocation_Id(Long locationId);
    List<Theatre> findAllByLocation_CityName(String cityName);
}
