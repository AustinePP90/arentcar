package com.apple.arentcar.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class DuplicateCarNumberException extends RuntimeException {
    public DuplicateCarNumberException(String message) {
        super(message);
    }
}
