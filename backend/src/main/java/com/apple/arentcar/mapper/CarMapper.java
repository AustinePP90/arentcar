package com.apple.arentcar.mapper;

import com.apple.arentcar.dto.*;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CarMapper {
    List<CarCardDTO> getAllCars(String branchName, String fuelType, String carTypeCategory, String carManufacturer, String seatingCapacity, String rentalDate, String returnDate, Integer rentalPeriod);

    Integer getFilterCarsCount(String branchName, String fuelType, String carTypeCategory, String carManufacturer, String seatingCapacity,String rentalDate,String returnDate);


    List<CarTypeDTO> getCarType();

    List<CarManufacturerDTO> getCarManufacturer();

    List<FuelTypeDTO> getFuelType();

    List<SeatingCapacityDTO> getSeatingCapacity();

    List<ModelYearDTO> getModelYear();

    List<BranchsDTO> getAllBranchs();

    List<CarTypeCategoryDTO> getCarTypeCategory();

    List<InsuranceDTO> getInsurance();

    int InsertUserReservation(UserReservationDTO userReservationDTO);

    List<RegionsDTO> getAllRegions();

    void updateCarStatus(Integer carCode);

    Integer getReservationNumber();

    List<BranchsDTO> getSelectedRegionBranchs(String region);
}
