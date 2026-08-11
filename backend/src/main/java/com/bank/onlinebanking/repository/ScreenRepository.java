package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.Screen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScreenRepository extends JpaRepository<Screen, Long> {
    List<Screen> findAllByTheatre_Id(Long theatreId);
}
