package com.example.besrc.Repository;

import com.example.besrc.Entities.EnumEntities.ESeat;
import com.example.besrc.Entities.EnumEntities.ESeatStatus;
import com.example.besrc.Entities.Hall;
import com.example.besrc.Entities.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Integer> {

    List<Seat> findByHallId (String hallId);

    Optional<Seat> findByHallIdAndRowIndexAndColIndex(String showId, int rowIndex, int colIndex);

    void deleteByHallId(String hallId);
    void deleteAllByHallId(String hallId);

    void deleteByHallAndRowIndexGreaterThanOrColIndexGreaterThan(Hall hall, int rowIndex, int colIndex);

    List<Seat> findByHallIdAndSeatType(String showId, ESeat seatType);
}
