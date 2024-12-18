package com.apple.arentcar.service;

import com.apple.arentcar.dto.*;
import com.apple.arentcar.mapper.CarMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarService {

    @Autowired
    private CarMapper CarMapper;

    public List<CarCardDTO> getAllCars(String branchName, String fuelType, String carTypeCategory, String carManufacturer, String seatingCapacity, String rentalDate, String returnDate, Integer rentalPeriod) {
        return CarMapper.getAllCars(branchName,fuelType,carTypeCategory,carManufacturer,seatingCapacity, rentalDate,returnDate, rentalPeriod);
    }

    public Integer getFilterCarsCount(String branchName, String fuelType, String carTypeCategory, String carManufacturer, String seatingCapacity,String rentalDate,String returnDate) {
        return CarMapper.getFilterCarsCount(branchName,fuelType,carTypeCategory,carManufacturer,seatingCapacity,rentalDate,returnDate);
    }

    public List<CarTypeDTO> getCarType() {return CarMapper.getCarType();}

    public List<CarManufacturerDTO> getCarManufacturer() {
        return CarMapper.getCarManufacturer();
    }

    public List<FuelTypeDTO> getFuelType() {
        return CarMapper.getFuelType();
    }

    public List<SeatingCapacityDTO> getSeatingCapacity() {
        return CarMapper.getSeatingCapacity();
    }

    public List<ModelYearDTO> getModelYear() {
        return CarMapper.getModelYear();
    }

    public List<BranchsDTO> getAllBranchs() {
        return CarMapper.getAllBranchs();
    }

    public List<CarTypeCategoryDTO> getCarTypeCategory() {
        return CarMapper.getCarTypeCategory();
    }

    public List<InsuranceDTO> getInsurance()  {
        return CarMapper.getInsurance();
    }


    public UserReservationDTO InsertUserReservation(UserReservationDTO userReservationDTO) {
        int rowsInserted = CarMapper.InsertUserReservation(userReservationDTO);
        if (rowsInserted == 0) {
            throw new IllegalStateException("Reservation could not be inserted");
        }
        return userReservationDTO;
    }

    public List<RegionsDTO> getAllRegions() {
        return CarMapper.getAllRegions();
    }

    public void updateCarStatus(Integer carCode) { CarMapper.updateCarStatus(carCode);
    }

    public Integer getReservationNumber() {
        return CarMapper.getReservationNumber();
    }

    public List<BranchsDTO> getSelectedRegionBranchs(String region) {
        return CarMapper.getSelectedRegionBranchs(region);
    }
}
