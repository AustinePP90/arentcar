package com.apple.arentcar.controller;

import com.apple.arentcar.model.*;
import com.apple.arentcar.service.CarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/arentcar")
public class CarController {

    @Autowired
    private CarService carService;

    @GetMapping("/user/cars")
    public List<RentalCars> getAllCars(
            @RequestParam(name = "branchName",required = false, defaultValue = "수원 본점") String branchName,
            @RequestParam(name = "fuelType",required = false) String fuelType,
            @RequestParam(name = "carTypeCategory",required = false) String carTypeCategory,
            @RequestParam(name = "carManufacturer",required = false) String carManufacturer,
            @RequestParam(name = "seatingCapacity",required = false) String seatingCapacity
    ) {
        return carService.getAllCars(branchName,fuelType,carTypeCategory,carManufacturer,seatingCapacity);
    }

    @GetMapping("/user/filter/countall")
    public Integer getFilterCarsCount(
            @RequestParam(name = "branchName",required = false, defaultValue = "수원 본점") String branchName,
            @RequestParam(name = "fuelType",required = false) String fuelType,
            @RequestParam(name = "carTypeCategory",required = false) String carTypeCategory,
            @RequestParam(name = "carManufacturer",required = false) String carManufacturer,
            @RequestParam(name = "seatingCapacity",required = false) String seatingCapacity
    ) {
        return carService.getFilterCarsCount(branchName,fuelType,carTypeCategory,carManufacturer, seatingCapacity);
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

    @GetMapping("/user/filter/cartypecategory")
    public List<CarTypeCategory> getCarTypeCategory() {
        return carService.getCarTypeCategory();
    }

    @GetMapping("/user/branchs")
    public List<Branchs> getAllBranchs() {
        return carService.getAllBranchs();
    }
}
