package com.apple.arentcar.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class ErrorResponse {
    @NonNull
    private String message;
    @NonNull
    private ErrorCode errorCode;
    private List<String> details;
}
