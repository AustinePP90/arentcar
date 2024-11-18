package com.apple.arentcar.mapper;

import com.apple.arentcar.model.*;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CarMapper {
    List<RentalCars> getAllCars();

    List<CarType> getCarType();

    List<CarManufacturer> getCarManufacturer();

    List<FuelType> getFuelType();

    List<SeatingCapacity> getSeatingCapacity();

    List<ModelYear> getModelYear();
}
