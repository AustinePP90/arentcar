package com.apple.arentcar.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class ExcelFileGenerationException extends RuntimeException {
    public ExcelFileGenerationException(String message) {
        super(message);
    }

    public ExcelFileGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
}
