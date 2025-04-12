package com.example.besrc.Service;

import com.example.besrc.Entities.Hall;
import com.example.besrc.Entities.Seat;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.requestClient.HallRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface HallService {
    List<Hall> getAll();
    Hall getHallById(String id);

    MyApiResponse newHall(Hall hall);

    MyApiResponse updateHall(String hallId, HallRequest request);

    MyApiResponse removeHall(String id);

    boolean isExistByName(String name);
    boolean isExistById(String Id);

    List<Seat> getAllSeatsByHall(String hallId);

}
