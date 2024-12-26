package com.apple.arentcar.model;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class RentalCars {

    private Integer carCode;
    @NotEmpty
    private Integer carTypeCode;
    @NotEmpty
    @Size(max = 12)
    private String carNumber;
    @NotEmpty
    @Size(max = 4)
    private String modelYear;
    @NotEmpty
    private Integer branchCode;
    @NotEmpty
    @Size(max = 2)
    private String carStatus;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
