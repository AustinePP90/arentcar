package com.apple.arentcar.controller;

import com.apple.arentcar.dto.*;
import com.apple.arentcar.service.CarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/arentcar")
public class CarController {

    @Autowired
    private CarService carService;

    @GetMapping("/user/cars")
    public List<CarCardDTO> getAllCars(
            @RequestParam(name = "branchName",required = false, defaultValue = "수원 본점") String branchName,
            @RequestParam(name = "fuelType",required = false) String fuelType,
            @RequestParam(name = "carTypeCategory",required = false) String carTypeCategory,
            @RequestParam(name = "carManufacturer",required = false) String carManufacturer,
            @RequestParam(name = "seatingCapacity",required = false) String seatingCapacity,
            @RequestParam(name = "rentalDate",required = false) String rentalDate,
            @RequestParam(name = "returnDate",required = false) String returnDate,
            @RequestParam (name = "rentalperiod") Integer rentalperiod
    ) {
        return carService.getAllCars(branchName,fuelType,carTypeCategory,carManufacturer,seatingCapacity, rentalDate,returnDate,rentalperiod);
    }

    @GetMapping("/user/cars/filter/countall")
    public Integer getFilterCarsCount(
            @RequestParam(name = "branchName",required = false, defaultValue = "수원 본점") String branchName,
            @RequestParam(name = "fuelType",required = false) String fuelType,
            @RequestParam(name = "carTypeCategory",required = false) String carTypeCategory,
            @RequestParam(name = "carManufacturer",required = false) String carManufacturer,
            @RequestParam(name = "seatingCapacity",required = false) String seatingCapacity,
            @RequestParam(name = "rentalDate",required = false) String rentalDate,
            @RequestParam(name = "returnDate",required = false) String returnDate
    ) {
        return carService.getFilterCarsCount(branchName,fuelType,carTypeCategory,carManufacturer, seatingCapacity,rentalDate,returnDate);
    }

    @GetMapping("/user/cars/filter/cartype")
    public List<CarTypeDTO> getCarType() {
        return carService.getCarType();
    }

    @GetMapping("/user/cars/filter/carmanufacturer")
    public List<CarManufacturerDTO> getCarManufacturer() {
        return carService.getCarManufacturer();
    }

    @GetMapping("/user/cars/filter/fueltype")
    public List<FuelTypeDTO> getFuelType() {
        return carService.getFuelType();
    }

    @GetMapping("/user/cars/filter/seatingcapacity")
    public List<SeatingCapacityDTO> getSeatingCapacity() {
        return carService.getSeatingCapacity();
    }

    @GetMapping("/user/cars/filter/modelyear")
    public List<ModelYearDTO> getModelYear() {
        return carService.getModelYear();
    }

    @GetMapping("/user/cars/filter/cartypecategory")
    public List<CarTypeCategoryDTO> getCarTypeCategory() {
        return carService.getCarTypeCategory();
    }

    @GetMapping("/user/cars/branchs")
    public List<BranchsDTO> getAllBranchs(@RequestParam(name = "region") String region) {
        return carService.getAllBranchs(region);
    }

    @PutMapping("/user/cars/reservation/updatecar/status")
    public ResponseEntity<Void> updateCarStatus(@RequestBody CarStatusRequest request) {
        carService.updateCarStatus(request.getCarCode());
        return ResponseEntity.ok(null);
    }


    @GetMapping("/user/cars/regions")
    public List<RegionsDTO> getAllRegions() {
        return carService.getAllRegions();
    }

    @GetMapping("/user/cars/insurance")
        public List<InsuranceDTO> getInsurance() { return carService.getInsurance(); }

    @GetMapping("/user/cars/reservation/number")
    public Integer getReservationNumber() {
        return carService.getReservationNumber();
    }


    @PostMapping("/user/cars/reservation")
    public ResponseEntity<UserReservationDTO> InsertUserReservation(
            @RequestParam (name = "userCode") Integer userCode,
            @RequestParam (name = "carCode") Integer carCode,
            @RequestParam (name = "rentalLocation") String rentalLocation,
            @RequestParam (name = "rentalDate") String rentalDate,
            @RequestParam (name = "rentalTime") String rentalTime,
            @RequestParam (name = "returnLocation") String returnLocation,
            @RequestParam (name = "returnDate") String returnDate,
            @RequestParam (name = "returnTime") String returnTime,
            @RequestParam (name = "insuranceType") String insuranceType,
            @RequestParam (name = "paymentCategory") String paymentCategory,
            @RequestParam (name = "paymentType") String paymentType,
            @RequestParam (name = "paymentAmount") Integer paymentAmount,
            @RequestParam (name = "reservationDate") String reservationDate,
            @RequestParam (name = "paymentDate") String paymentDate

    ) {
        UserReservationDTO userReservationDTO = new UserReservationDTO(userCode,carCode,rentalLocation,rentalDate,rentalTime,returnLocation,returnDate,returnTime,insuranceType,paymentCategory,paymentType,paymentAmount,reservationDate,paymentDate);
        UserReservationDTO savedReservation = carService.InsertUserReservation(userReservationDTO);
        return ResponseEntity.ok(savedReservation);
    }

}
