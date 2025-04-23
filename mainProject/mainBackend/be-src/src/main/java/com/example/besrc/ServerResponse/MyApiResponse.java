package com.example.besrc.ServerResponse;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

@Setter
@Getter
public class MyApiResponse {
    private String message;
    private String status;
    private Integer code; // Thêm trường code

    public MyApiResponse(String message) {
        this.message = message;
        this.status = null;
        this.code = null;
    }

    public MyApiResponse(String message, String status) {
        this.message = message;
        this.status = status;
        this.code = null;
    }

    public MyApiResponse(String message, HttpStatus status) {
        this.message = message;
        this.status = status.name();
        this.code = status.value();
    }

    public MyApiResponse(String status, int code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}