package com.apple.arentcar.service;

import com.apple.arentcar.mapper.CarMapper;
import com.apple.arentcar.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarService {

    @Autowired
    private CarMapper CarMapper;

    public List<RentalCars> getAllCars(String branchName, String fuelType, String carTypeCategory, String carManufacturer, String seatingCapacity) {
        return CarMapper.getAllCars(branchName,fuelType,carTypeCategory,carManufacturer,seatingCapacity);
    }

    public Integer getFilterCarsCount(String branchName, String fuelType, String carTypeCategory, String carManufacturer, String seatingCapacity) {
        return CarMapper.getFilterCarsCount(branchName,fuelType,carTypeCategory,carManufacturer,seatingCapacity);
    }

    public List<CarType> getCarType() {return CarMapper.getCarType();}

    public List<CarManufacturer> getCarManufacturer() {
        return CarMapper.getCarManufacturer();
    }

    public List<FuelType> getFuelType() {
        return CarMapper.getFuelType();
    }

    public List<SeatingCapacity> getSeatingCapacity() {
        return CarMapper.getSeatingCapacity();
    }

    public List<ModelYear> getModelYear() {
        return CarMapper.getModelYear();
    }

    public List<Branchs> getAllBranchs() {
        return CarMapper.getAllBranchs();
    }

    public List<CarTypeCategory> getCarTypeCategory() {
        return CarMapper.getCarTypeCategory();
    }
}
