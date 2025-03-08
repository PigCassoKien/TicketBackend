package com.example.besrc.ServerResponse;

import com.example.besrc.Entities.Booking;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class BookingResponse {
    private String id;
    private String showId;
    private String fullname;
    private double price;
    private List<String> seats;
    private String filmName;
    private String hallName;
    private String startingTime;
    private String status;
    private String createAt;

    public BookingResponse(Booking booking) {
        this.id = booking.getId();
        this.showId = booking.getShow().getId();
        this.fullname = booking.getAccount().getFullName();
        this.price = booking.getPriceFromListSeats();
        this.seats = booking.getNameOfSeats();
        this.filmName = booking.getShow().getFilm().getTitle();
        this.hallName = booking.getShow().getHall().getName();
        this.startingTime = booking.getShow().getStartTime().toString();
        this.status = booking.getStatus().name();
        this.createAt = booking.getShow().getCreateAt().toString();
    }

}
