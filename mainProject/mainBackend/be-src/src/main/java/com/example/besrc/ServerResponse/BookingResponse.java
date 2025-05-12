package com.example.besrc.ServerResponse;

import com.example.besrc.Entities.Booking;
import com.example.besrc.Entities.ShowSeat;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class BookingResponse {
    private String id;
    private String showId;
    private String fullname;
    private String username;
    private String phoneNumber;
    private String email;
    private String address;
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
        this.username = booking.getAccount().getUsername();
        this.phoneNumber = booking.getAccount().getPhoneNumber();
        this.email = booking.getAccount().getEmail();
        this.address = booking.getAccount().getAddress();
        this.price = booking.getPriceFromListSeats();
        this.seats = booking.getNameOfSeats();
        this.filmName = booking.getShow().getFilm().getTitle();
        this.hallName = booking.getShow().getHall().getName();
        this.startingTime = booking.getShow().getStartTime().toString();
        this.status = booking.getStatus().name();
        this.createAt = booking.getCreateAt().toString();
    }

}
