package com.apple.arentcar.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class CarTypes {

    @JsonProperty("car_type_code")
    private Integer carTypeCode;
    @NotEmpty
    @Size(max = 2)
    @JsonProperty("car_type_category")
    private String carTypeCategory;
    @NotEmpty
    @Size(max = 2)
    @JsonProperty("origin_type")
    private String originType;
    @NotEmpty
    @Size(max = 20)
    @JsonProperty("car_type_name")
    private String carTypeName;
    @NotEmpty
    @Size(max = 2)
    @JsonProperty("seating_capacity")
    private String seatingCapacity;
    @NotEmpty
    @Size(max = 2)
    @JsonProperty("fuel_type")
    private String fuelType;
    @NotEmpty
    @Size(max = 2)
    @JsonProperty("speed_limit")
    private String speedLimit;
    @NotEmpty
    @Size(max = 2)
    @JsonProperty("license_restriction")
    private String licenseRestriction;
    @NotEmpty
    @Size(max = 2)
    @JsonProperty("car_manufacturer")
    private String carManufacturer;
    @Size(max = 10)
    @JsonProperty("model_year")
    private String modelYear;
    @NotEmpty
    private String carImageName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
