package com.example.besrc.ServerResponse;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

import java.util.List;

@Setter
@Getter
public class ExceptionResponse {
    private HttpStatus status;
    private String message;
    private List<String> errors;

    public ExceptionResponse(HttpStatus status, String message, List<String> errors) {
        super();
        this.status = status;
        this.message = message;
        this.errors = errors;
    }

}
