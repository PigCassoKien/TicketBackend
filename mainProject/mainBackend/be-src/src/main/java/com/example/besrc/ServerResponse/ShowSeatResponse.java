package com.example.besrc.ServerResponse;

import com.example.besrc.Entities.ShowSeat;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ShowSeatResponse {
    private String seatId;
    private String status;
    private String type;
    private String seatName;
    private int rowIndex;
    private int colIndex;
    private double price;
    private String seatIndex;

    public ShowSeatResponse(ShowSeat seat) {
        this.seatId = seat.getId();
        this.status = seat.getStatus().toString();
        this.type = String.valueOf(seat.getSeat().getSeatType());
        this.seatName = seat.getSeat().getName();
        this.rowIndex = seat.getSeat().getRowIndex();
        this.colIndex = seat.getSeat().getColIndex();
        this.price = seat.getSeat().getPrice();
        this.seatIndex = seat.getSeatIndex();
    }

}
