package com.example.besrc.Repository;

import com.example.besrc.Entities.Hall;
import com.example.besrc.Entities.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShowRepository extends JpaRepository<Show, String> {
    boolean existsByHall(Hall hall);
}
