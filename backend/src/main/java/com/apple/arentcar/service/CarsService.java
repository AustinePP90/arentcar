package com.apple.arentcar.service;

import com.apple.arentcar.dto.CarTypesDTO;
import com.apple.arentcar.exception.CarNotFoundException;
import com.apple.arentcar.mapper.CarsMapper;
import com.apple.arentcar.model.CarTypes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarsService {

    @Autowired
    private CarsMapper carsMapper;

    // 차종 조회 및 페이지네이션
    public List<CarTypesDTO> getCarsWithPaging(int pageSize, int pageNumber) {
        int offset = (pageNumber - 1) * pageSize; // offset 계산 식
        return carsMapper.getCarsWithPaging(pageSize, offset);
    }

    // 차종 조회 및 페이지네이션(검색 기능 포함)
    public List<CarTypesDTO> getCarsByNameWithPaging(String carTypeName,
                                                  int pageSize,
                                                  int pageNumber) {
        int offset = (pageNumber - 1) * pageSize;
        return carsMapper.getCarsByNameWithPaging(carTypeName, pageSize, offset);
    }

    // 조건에 따라 차종 수 조회
    public int countCarsWithConditions(String carTypeName) {
        return carsMapper.countCarsWithConditions(carTypeName);
    }

    // 차종 등록
    public CarTypes createCars(CarTypes carTypes) {
        carsMapper.createCars(carTypes);
        return carTypes;
    }

    // 차종 삭제
    public void deleteCarsById(Integer carTypeCode) {
        // 차종 존재 여부 확인
        if (!carsMapper.existsByCarTypeCode(carTypeCode)) {
            throw new CarNotFoundException(
                    String.format("차종 코드 '%d'에 해당하는 차량을 찾을 수 없습니다.", carTypeCode),
                    List.of("차종 코드를 찾을 수 없어 차량 삭제에 실패했습니다.")
            );
        }
        carsMapper.deleteCarsById(carTypeCode);
    }

    // 차종 수정
    public void updateCarsById(CarTypes carTypes) {
        // 차종 존재 여부 확인
        if (!carsMapper.existsByCarTypeCode(carTypes.getCarTypeCode())) {
            throw new CarNotFoundException(
                    String.format("차종 코드 '%d'에 해당하는 차량을 찾을 수 없습니다.", carTypes.getCarTypeCode()),
                    List.of("차종 코드를 찾을 수 없어 차량 삭제에 실패했습니다.")
            );
        }
        try {
            carsMapper.updateCarsById(carTypes);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("데이터 무결성 제약 조건 위반으로 차량 정보를 수정할 수 없습니다.", e);
        }
    }

}
