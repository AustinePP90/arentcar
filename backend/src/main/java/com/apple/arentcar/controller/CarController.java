package com.apple.arentcar.controller;

import com.apple.arentcar.model.*;
import com.apple.arentcar.service.CarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/arentcar")
public class CarController {

    @Autowired
    private CarService carService;

    @GetMapping("/user/cars")
    public List<RentalCars> getAllCars() {
        return carService.getAllCars();
    }

    @GetMapping("/user/filter/cartype")
    public List<CarType> getCarType() {
        return carService.getCarType();
    }

    @GetMapping("/user/filter/carmanufacturer")
    public List<CarManufacturer> getCarManufacturer() {
        return carService.getCarManufacturer();
    }

    @GetMapping("/user/filter/fueltype")
    public List<FuelType> getFuelType() {
        return carService.getFuelType();
    }

    @GetMapping("/user/filter/seatingcapacity")
    public List<SeatingCapacity> getSeatingCapacity() {
        return carService.getSeatingCapacity();
    }

    @GetMapping("/user/filter/modelyear")
    public List<ModelYear> getModelYear() {
        return carService.getModelYear();
    }
}
