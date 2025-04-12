package com.example.besrc.Exception;

import com.example.besrc.ServerResponse.ErrorResponse;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.io.Serial;

@Setter
@ResponseStatus(code = HttpStatus.BAD_REQUEST)
public class BadRequestException extends RuntimeException {
    @Serial
    private static final long serialVersionUID = 8108123746983559934L;

    private ErrorResponse errorResponse;
    private String message;

    public BadRequestException(ErrorResponse errorResponse) {
        this.errorResponse = errorResponse;
    }

    public BadRequestException(String message) {
        this.message = message;
    }

    public BadRequestException(String message, Throwable cause) {
        super(message, cause);
    }

    public ErrorResponse getErrorResponse() {
        return errorResponse;
    }

    @Override
    public String getMessage() {
        return message;
    }

}
