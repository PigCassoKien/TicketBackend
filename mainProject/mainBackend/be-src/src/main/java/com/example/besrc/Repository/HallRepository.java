package com.example.besrc.Repository;

import com.example.besrc.Entities.Hall;
import com.example.besrc.Entities.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HallRepository extends JpaRepository<Hall, String> {
    Optional<Hall> findByName(String hallName);

    boolean existsByName(String hallName);

}
