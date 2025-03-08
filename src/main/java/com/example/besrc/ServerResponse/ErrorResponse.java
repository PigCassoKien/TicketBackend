package com.example.besrc.ServerResponse;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.http.HttpStatus;
import org.springframework.validation.ObjectError;

import java.util.List;

public class ErrorResponse extends MyApiResponse {

    @JsonProperty("status")
    private HttpStatus status;

    public ErrorResponse(String validationFailed, List<ObjectError> allErrors) {
        super("");

    }
    public ErrorResponse(String message) {
        super(message);
    }

    public ErrorResponse(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}
