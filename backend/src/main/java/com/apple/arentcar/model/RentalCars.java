package com.apple.arentcar.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RentalCars {

    private String carTypeName;

    private String fuelType;

    private String seatingCapacity;

    private String modelYear;

    private String carImageName;
}
