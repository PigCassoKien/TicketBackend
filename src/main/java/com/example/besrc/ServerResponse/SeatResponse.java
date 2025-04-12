package com.example.besrc.ServerResponse;

import com.example.besrc.Entities.EnumEntities.ESeatStatus;
import com.example.besrc.Entities.Seat;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class SeatResponse {
    private String seatName;
    private String type;
    private ESeatStatus seatStatus;
    private double price;

    public SeatResponse(Seat seat) {
        this.seatName = seat.getName();
        this.type = String.valueOf(seat.getSeatType());
        this.seatStatus = seat.getStatus();
        this.price = seat.getPrice();
    }

}
