package com.example.besrc.Exception;

import com.example.besrc.ServerResponse.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.io.Serial;

@ResponseStatus(code = HttpStatus.CONFLICT)
public class ConflictException extends RuntimeException {
    @Serial
    private static final long serialVersionUID = 3943762563765144238L;

    private ErrorResponse errorResponse;
    private String message;

    public ConflictException(String message) {
        super(message);
        this.message = message;
    }
    public ConflictException(ErrorResponse errorResponse) {
        this.errorResponse = errorResponse;
    }
    public ConflictException(String message, Throwable cause) {
        super(message, cause);
        this.message = message;
    }

    public ErrorResponse getErrorResponse() {
        return errorResponse;
    }

    public void setErrorResponse(ErrorResponse errorResponse) {
        this.errorResponse = errorResponse;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
