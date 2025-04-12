package com.example.besrc.Exception;


import org.springframework.http.HttpStatus;

import java.io.Serial;

public class APIException extends RuntimeException{
    @Serial
    private static final long serialVersionUID = -7098849379729809240L;

    private HttpStatus status;
    private String message;

    public APIException(HttpStatus status, String message) {
        super();
        this.status = status;
        this.message = message;
    }
    public APIException(HttpStatus status, String message, Throwable cause) {
        super(cause);
        this.status = status;
        this.message = message;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public void setStatus(HttpStatus status) {
        this.status = status;
    }

    @Override
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
