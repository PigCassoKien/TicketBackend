package com.example.besrc.Exception;

import com.example.besrc.ServerResponse.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.io.Serial;

@ResponseStatus(code = HttpStatus.INTERNAL_SERVER_ERROR)
public class ErrorServerException extends RuntimeException {
    @Serial
    private static final long serialVersionUID = 3837024324741564314L;

    private ErrorResponse errorResponse;
    private String message;

    public ErrorServerException(String message) {
        super(message);
        this.message = message;
    }

    public ErrorServerException(String message, Throwable cause) {
        super(message, cause);
    }

    public ErrorServerException( ErrorResponse errorResponse) {
        this.errorResponse = errorResponse;
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
