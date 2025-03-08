package com.example.besrc.ServerResponse;

import com.example.besrc.Entities.Show;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ShowInformationResponse {
    private String id;
    private String hallName;
    private String hallId;
    private String filmName;
    private String filmId;
    private String startTime;
    private String endTime;
    private int totalSeats;
    private int reservedSeats;
    private int availableSeats;

    public ShowInformationResponse(Show show, int reservedSeats, int availableSeats) {
        this.id = show.getId();
        this.hallName = show.getHall().getName();
        this.hallId = show.getHall().getId();
        this.filmName = show.getFilm().getTitle();
        this.filmId = String.valueOf(show.getFilm().getId());
        this.startTime = show.getStartTime().toString();
        this.totalSeats = show.getHall().getCapacity();
        this.reservedSeats = reservedSeats;
        this.availableSeats = availableSeats;
    }


}
