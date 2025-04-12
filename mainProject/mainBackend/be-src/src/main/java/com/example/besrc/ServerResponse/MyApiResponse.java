package com.example.besrc.ServerResponse;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

@Setter
@Getter
public class MyApiResponse {
    private String message;
    private String status;

    public MyApiResponse(String message) {
        this.message = message;
    }

    public MyApiResponse(String message, String status) {
        this.message = message;
        this.status = status;
    }

    public MyApiResponse(String message, HttpStatus status) {
        this.message = message;
        this.status = status.name();
    }

    public MyApiResponse(String ok, int value, String cancelBookingSuccess) {
    }


}
