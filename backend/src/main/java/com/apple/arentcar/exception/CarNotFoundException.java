package com.apple.arentcar.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.List;

@Getter
@ResponseStatus(HttpStatus.NOT_FOUND)
public class CarNotFoundException extends RuntimeException {
    private List<String> details;

    public CarNotFoundException(String message) {
        super(message);
    }

    public CarNotFoundException(String message, List<String> details) {
        super(message);
        this.details = details;
    }

    public CarNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
