package com.example.besrc.Repository;

import com.example.besrc.Entities.EnumEntities.ESeatStatus;
import com.example.besrc.Entities.ShowSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Transactional
@Repository
public interface ShowSeatRepository extends JpaRepository<ShowSeat, String> {
    int countByShowIdAndStatus(String showId, ESeatStatus status);

    List<ShowSeat> findByShowId(String showId);

    void deleteAllByShowId(String showId);

    Optional<ShowSeat> findBySeatIndexAndShowId(String seatIndex, String showId);
}