package com.example.besrc.Repository;

import com.example.besrc.Entities.Booking;
import com.example.besrc.Entities.EnumEntities.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findAllByAccountId(String accountId);
    List<Booking> findAllByStatus (BookingStatus status);

    Optional<Booking> findByIdAndAccountId(String bookingId, String accountId);

    @Query("Select b from Booking b where b.account.id = :accountId and b.show.film.id = :filmId and b.status = :status")
    Optional<Booking> findByAccount_AccountIdAAndCinemaShowFilmFilmIdAndStatus(@Param("accountId") String accountId, @Param("filmId") long filmId, @Param("status") BookingStatus status);

    int countByShowId(String showId);

    List<Booking> findAllByShowId(String showId);
}
