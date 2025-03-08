package com.example.besrc.Exception;

import com.example.besrc.ServerResponse.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.io.Serial;

@ResponseStatus(HttpStatus.LOCKED)
public class LockException extends RuntimeException {
    @Serial
    private static final long serialVersionUID = -8186773938823778332L;

    private ErrorResponse error;
    private String message;

    public LockException(ErrorResponse error) {
        this.error = error;
    }

    public LockException(String message, Throwable cause) {
        super(message, cause);
    }

    public LockException(String message) {
        super(message);
        this.message = message;
    }

    public ErrorResponse getErrorResponse() {
        return this.error;
    }

    public void setErrorResponse(ErrorResponse error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
