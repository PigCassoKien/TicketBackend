package com.example.besrc.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.io.Serial;

@ResponseStatus(code = HttpStatus.FORBIDDEN)
public class DenyAccessException extends RuntimeException {
    @Serial
    private static final long serialVersionUID = 2473561771611077491L;

    private ErrorResponse errorResponse;
    private String message;

    public DenyAccessException(ErrorResponse errorResponse){
        this.errorResponse = errorResponse;
    }

    public DenyAccessException(String message, Throwable cause) {
        super(message, cause);
        this.message = message;
    }

    public DenyAccessException(String message) {
        super(message);
        this.message = message;
    }

    public ErrorResponse getErrorResponse() {
        return errorResponse;
    }

    public void setErrorResponse(ErrorResponse errorResponse) {
        this.errorResponse = errorResponse;
    }

    @Override
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
