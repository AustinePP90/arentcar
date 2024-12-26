package com.apple.arentcar.exception;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@RequiredArgsConstructor
public class ErrorResponse {
    @NonNull
    private String message;
    @NonNull
    private ErrorCode errorCode;
    private List<String> details;
}
