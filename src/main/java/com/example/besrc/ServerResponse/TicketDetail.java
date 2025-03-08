package com.example.besrc.ServerResponse;

import com.example.besrc.Entities.Booking;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class TicketDetail {
    private String filmName;
    private String hallName;
    private String startTime;
    private String price;
    private List<String> seats;

    public TicketDetail(Booking booking) {
        this.filmName = booking.getShow().getFilm().getTitle();
        this.hallName = booking.getShow().getHall().getName();
        this.startTime = booking.getShow().getStartTime().toString();
        this.price = String.valueOf(booking.getPriceFromListSeats());
        this.seats = booking.getNameOfSeats();
    }

}
