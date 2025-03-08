package com.example.besrc.Exception;

import com.example.besrc.ServerResponse.ErrorResponse;
import io.jsonwebtoken.ExpiredJwtException;
import org.apache.coyote.BadRequestException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.LockedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ServerErrorException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@Order(Ordered.HIGHEST_PRECEDENCE)
@ControllerAdvice
public class GlobalControllerException extends ResponseEntityExceptionHandler {
    @ExceptionHandler({NullPointerException.class})
    @ResponseBody
    public ResponseEntity<ErrorResponse> nullPointException(Exception e) {
        ErrorResponse error = new ErrorResponse("Got NULL variable in field(s). Please check them again.", HttpStatus.BAD_REQUEST);
        return new ResponseEntity< >(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseBody
    public ResponseEntity<ErrorResponse> accessDenied(AccessDeniedException exception) {
        ErrorResponse error = new ErrorResponse(exception.getMessage(), HttpStatus.FORBIDDEN);
        return new ResponseEntity< >(error, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(LockedException.class)
    @ResponseBody
    public ResponseEntity<ErrorResponse> lockedException(LockedException exception) {
        ErrorResponse error = new ErrorResponse(exception.getMessage(), HttpStatus.LOCKED);
        return new ResponseEntity< >(error, HttpStatus.LOCKED);
    }

    @ExceptionHandler(BadRequestException.class)
    @ResponseBody
    public ResponseEntity<ErrorResponse> badRequest(BadRequestException exception) {
        ErrorResponse error = new ErrorResponse(exception.getMessage(), HttpStatus.BAD_REQUEST);
        return new ResponseEntity< >(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(NotFoundException.class)
    @ResponseBody
    public ResponseEntity<ErrorResponse> notFound(NotFoundException exception) {
        ErrorResponse error = new ErrorResponse(exception.getMessage(), HttpStatus.NOT_FOUND);
        return new ResponseEntity< >(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ConflictException.class)
    @ResponseBody
    public ResponseEntity<ErrorResponse> conFlict(ConflictException exception) {
        ErrorResponse error = new ErrorResponse(exception.getMessage(), HttpStatus.CONFLICT);
        return new ResponseEntity< >(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler({ServerErrorException.class})
    @ResponseBody
    public ResponseEntity<ErrorResponse> internalServerError(Exception exception) {
        ErrorResponse error = new ErrorResponse(exception.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        return new ResponseEntity< >(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(value = {ExpiredJwtException.class})
    public ResponseEntity<ErrorResponse> handleExpiredJwtException(ExpiredJwtException exception, WebRequest request) {
//		String requestUri = ((ServletWebRequest)request).getRequest().getRequestURI().toString();
        ErrorResponse error = new ErrorResponse(exception.getMessage(), HttpStatus.CONFLICT);
        return new ResponseEntity< >(error, HttpStatus.CONFLICT);
    }
}
