package com.example.besrc.Repository;

import com.example.besrc.Entities.Show;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CinemaShowRepository extends JpaRepository<Show, String> {
    @Query(value = "select s from Show s where ((:startTime >= s.startTime)) and s.hall.id = :hallId")
    List<Show> findConflictingShows(@Param("startTime")LocalDateTime startTime, @Param("hallId")Long hallId);

    List<Show> findByHallId(String hallId);
    List<Show> findByFilmId(Long film_id);

    @Query(value = "select s from Show s where s.hall.id = :hallId and s.film.id = :filmId and s.startTime = :startTime")
    Show findByHallHallIdAndFilmFilmId(@Param("hallId") String hallId, @Param("filmId") @NotBlank @NotNull String filmId, @Param("startTime") LocalDateTime startTime);
}
