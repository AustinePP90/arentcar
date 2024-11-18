package com.apple.arentcar.service;

import com.apple.arentcar.mapper.CarMapper;
import com.apple.arentcar.mapper.MenusMapper;
import com.apple.arentcar.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarService {

    @Autowired
    private CarMapper CarMapper;

    public List<RentalCars> getAllCars() {
        return CarMapper.getAllCars();
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
}
