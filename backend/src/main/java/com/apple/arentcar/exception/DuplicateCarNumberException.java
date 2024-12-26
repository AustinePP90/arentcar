package com.apple.arentcar.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.List;

@Getter
@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateCarNumberException extends RuntimeException {
    private List<String> details;

    public DuplicateCarNumberException(String message) {
        super(message);
    }

    public DuplicateCarNumberException(String message, List<String> details) {
        super(message);
        this.details = details;
    }

    public DuplicateCarNumberException(String message, Throwable cause) {
        super(message, cause);
    }
}
