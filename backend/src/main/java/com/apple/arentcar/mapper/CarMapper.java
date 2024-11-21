package com.apple.arentcar.mapper;

import com.apple.arentcar.model.*;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CarMapper {
    List<RentalCars> getAllCars(String branchName, String fuelType, String carTypeCategory, String carManufacturer, String seatingCapacity);

    Integer getFilterCarsCount(String branchName, String fuelType, String carTypeCategory, String carManufacturer, String seatingCapacity);


    List<CarType> getCarType();

    List<CarManufacturer> getCarManufacturer();

    List<FuelType> getFuelType();

    List<SeatingCapacity> getSeatingCapacity();

    List<ModelYear> getModelYear();

    List<Branchs> getAllBranchs();

    List<CarTypeCategory> getCarTypeCategory();
}
