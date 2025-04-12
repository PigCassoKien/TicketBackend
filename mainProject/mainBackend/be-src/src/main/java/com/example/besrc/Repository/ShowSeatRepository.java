package com.example.besrc.Repository;

import com.example.besrc.Entities.EnumEntities.ESeat;
import com.example.besrc.Entities.EnumEntities.ESeatStatus;
import com.example.besrc.Entities.ShowSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    List<ShowSeat> findByShowIdAndStatus(String showId, ESeatStatus seatStatus);

    List<ShowSeat> findByShowIdAndSeat_SeatType(String showId, ESeat seatType);

    Optional<ShowSeat> findBySeatIdAndShowId(Long seatId, String showId);

    @Query(value = "SELECT * FROM show_seat WHERE seat_id IN :seatIds", nativeQuery = true)
    List<ShowSeat> findBySeatIdIn(@Param("seatIds") List<Long> seatIds);

    @Modifying
    @Query(value = "DELETE FROM show_seat WHERE seat_id IN :seatIds", nativeQuery = true)
    void deleteBySeatIdIn(@Param("seatIds") List<Long> seatIds);
}