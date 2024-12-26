package com.apple.arentcar.mapper;

import com.apple.arentcar.dto.RentalCarsBranchOptionAttrDTO;
import com.apple.arentcar.dto.RentalCarsCarOptionAttrDTO;
import com.apple.arentcar.dto.RentalCarsDTO;
import com.apple.arentcar.model.RentalCars;
import org.apache.ibatis.annotations.*;
import org.springframework.security.core.parameters.P;

import java.util.List;

@Mapper
public interface RentalCarsMapper {

    // 차량 등록
    void createRentalCars(RentalCars rentalCars);
    // 중복 차량 번호 검사
    @Select("SELECT EXISTS (SELECT 1 FROM rental_cars WHERE car_number = #{carNumber})")
    boolean existsByCarNumber(@Param("carNumber") String carNumber);
    // PK로 차량 존재 여부 검사
    @Select("SELECT EXISTS (SELECT 1 FROM rental_cars WHERE car_code = #{carCode})")
    boolean existsByCarCode(@Param("carCode") Integer carCode);
    // 차량 삭제
    @Delete("DELETE FROM rental_cars where car_code = #{carCode}")
    void deleteRentalCarsById(@Param("carCode") Integer carCode);
    // 차량 수정
    void updateRentalCarsById(RentalCars rentalCars);
    // 차량 조회 및 페이지네이션(검색 기능 포함)
    List<RentalCarsDTO> getRentalCarsWithPaging(@Param("carNumber") String carNumber,
                                                @Param("carStatus") String carStatus,
                                                @Param("carTypeName") String carTypeName,
                                                @Param("branchName") String branchName,
                                                @Param("carTypeCategory") String carTypeCategory,
                                                @Param("originType") String originType,
                                                @Param("seatingCapacity") String seatingCapacity,
                                                @Param("fuelType") String fuelType,
                                                @Param("carManufacturer") String carManufacturer,
                                                @Param("modelYear") String modelYear,
                                                @Param("pageSize") int pageSize,
                                                @Param("offset") int offset);
    // 조건에 따라 차량 수 조회
    int countRentalCarsWithConditions(@Param("carNumber") String carNumber,
                                      @Param("carStatus") String carStatus,
                                      @Param("carTypeName") String carTypeName,
                                      @Param("branchName") String branchName,
                                      @Param("carTypeCategory") String carTypeCategory,
                                      @Param("originType") String originType,
                                      @Param("seatingCapacity") String seatingCapacity,
                                      @Param("fuelType") String fuelType,
                                      @Param("carManufacturer") String carManufacturer,
                                      @Param("modelYear") String modelYear);
    // 렌탈가능/렌탈중/정비중 전체 차량 수 조회
    @Select("SELECT COUNT(*) FROM rental_cars WHERE car_status = #{carStatus}")
    int countAvailableRentalCars(@Param("carStatus") String carStatus);
    // <select>의 <option>값으로 차량코드/명 동적으로 불러오기
    @Select("SELECT car_type_code, car_type_name FROM car_types")
    List<RentalCarsCarOptionAttrDTO> getRentalCarsCodeName();
    // <select>의 <option>값으로 지점코드/명 동적으로 불러오기
    @Select("SELECT branch_code, branch_name FROM branchs")
    List<RentalCarsBranchOptionAttrDTO> getRentalCarsBranchCodeName();
    // 엑셀 파일 다운로드용 차량 조회
    List<RentalCarsDTO> getRentalCarsForExcel();
    // 정비중인 차량 정비완료(렌탈가능)로 수정
    @Update("UPDATE rental_cars SET car_status = \"01\" WHERE car_code = #{carCode}")
    void updateRentalCarsStatusToAvailableById(Integer carCode);
}
