package com.apple.arentcar.service;

import com.apple.arentcar.dto.RentalCarsBranchOptionAttrDTO;
import com.apple.arentcar.dto.RentalCarsDTO;
import com.apple.arentcar.dto.RentalCarsCarOptionAttrDTO;
import com.apple.arentcar.exception.DuplicateCarNumberException;
import com.apple.arentcar.mapper.RentalCarsMapper;
import com.apple.arentcar.model.RentalCars;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Service
public class RentalCarsService {

    @Autowired
    private RentalCarsMapper rentalCarsMapper;

    // 차량 등록
    public RentalCars createRentalCars(RentalCars rentalCars) {
        // 중복 차량 번호 검사
        if (rentalCarsMapper.existsByCarNumber(rentalCars.getCarNumber())) {
            throw new DuplicateCarNumberException(
                    String.format("해당 차량 번호 '%s'는 이미 등록되어 있습니다.", rentalCars.getCarNumber()),
                    List.of("중복된 차량 번호를 등록하려고 시도했습니다.")
            );
        }

        rentalCarsMapper.createRentalCars(rentalCars);
        return rentalCars;
    }

    // 차량 삭제
    public void deleteRentalCarsById(Integer carCode) { rentalCarsMapper.deleteRentalCarsById(carCode); }

    // 차량 수정
    public void updateRentalCarsById(RentalCars rentalCars) { rentalCarsMapper.updateRentalCarsById(rentalCars); }
    
    // 차량 조회 및 페이지네이션(검색 기능 포함)
    public List<RentalCarsDTO> getRentalCarsWithPaging(String carNumber, String carStatus, String carTypeName, String branchName,
                                                       String carTypeCategory, String originType, String seatingCapacity,
                                                       String fuelType, String carManufacturer, String modelYear,
                                                       int pageSize,
                                                       int pageNumber) {
        int offset = (pageNumber - 1) * pageSize;
        return rentalCarsMapper.getRentalCarsWithPaging(carNumber, carStatus, carTypeName, branchName, carTypeCategory,
                                                        originType, seatingCapacity, fuelType, carManufacturer, modelYear,
                                                        pageSize, offset);
    }

    // 조건에 따라 차량 수 조회
    public int countRentalCarsWithConditions(String carNumber, String carStatus, String carTypeName, String branchName,
                                             String carTypeCategory, String originType, String seatingCapacity,
                                             String fuelType, String carManufacturer, String modelYear) {
        return rentalCarsMapper.countRentalCarsWithConditions(carNumber, carStatus, carTypeName, branchName,
                                                              carTypeCategory, originType, seatingCapacity, fuelType,
                                                              carManufacturer, modelYear);
    }

    // 렌탈가능/렌탈중/정비중 전체 차량 수 조회
    public int countAvailableRentalCars(String carStatus) { return rentalCarsMapper.countAvailableRentalCars(carStatus); }

    // <select>의 <option>값으로 차량코드/명 동적으로 불러오기
    public List<RentalCarsCarOptionAttrDTO> getRentalCarsCodeName() {
       return rentalCarsMapper.getRentalCarsCodeName();
    }

    // <select>의 <option>값으로 지점코드/명 동적으로 불러오기
    public List<RentalCarsBranchOptionAttrDTO> getRentalCarsBranchCodeName() {
        return rentalCarsMapper.getRentalCarsBranchCodeName();
    }

    // 차량 데이터를 엑셀 파일로 생성하기
    public byte[] generateExcelFile() throws IOException {
        List<RentalCarsDTO> rentalCarsDTO = rentalCarsMapper.getRentalCarsForExcel();

        // Workbook은 엑셀 파일을 생성하는 데 사용되며, ByteArrayOutputStream은 엑셀 파일을 바이트 배열로 변환하는 데 사용됨
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            // Workbook 내에 새로운 시트(Sheet) 생성
            Sheet sheet = workbook.createSheet("RentalCars");

            // 헤더 행(Row) 생성
            Row headerRow = sheet.createRow(0);
            // 각 셀에 제목을 설정(createCell)하여 데이터의 각 열을 설명(setCellValue)
            headerRow.createCell(0).setCellValue("Car Code");
            headerRow.createCell(1).setCellValue("Car Type Name");
            headerRow.createCell(2).setCellValue("Car Type Code");
            headerRow.createCell(3).setCellValue("Car Number");
            headerRow.createCell(4).setCellValue("Car Status");
            headerRow.createCell(5).setCellValue("Car Status Code");
            headerRow.createCell(6).setCellValue("Branch Name");
            headerRow.createCell(7).setCellValue("Branch Code");
            headerRow.createCell(8).setCellValue("Car Type Category");
            headerRow.createCell(9).setCellValue("Origin Type");
            headerRow.createCell(10).setCellValue("Seating Capacity");
            headerRow.createCell(11).setCellValue("Fuel Type");
            headerRow.createCell(12).setCellValue("Car Manufacturer");
            headerRow.createCell(13).setCellValue("Model Year");

            // 데이터 행(Row) 생성
            int rowIdx = 1; // 헤더 행(Row)이 0에서 시작이라 데이터는 1에서부터 입력함
            for (RentalCarsDTO rentalCar : rentalCarsDTO) { // DB에서 읽어온 데이터를 반복문을 이용해 셀에 입력
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(rentalCar.getCarCode());
                row.createCell(1).setCellValue(rentalCar.getCarTypeName());
                row.createCell(2).setCellValue(rentalCar.getCarTypeCode());
                row.createCell(3).setCellValue(rentalCar.getCarNumber());
                row.createCell(4).setCellValue(rentalCar.getCarStatus());
                row.createCell(5).setCellValue(rentalCar.getCarStatusCode());
                row.createCell(6).setCellValue(rentalCar.getBranchName());
                row.createCell(7).setCellValue(rentalCar.getBranchCode());
                row.createCell(8).setCellValue(rentalCar.getCarTypeCategory());
                row.createCell(9).setCellValue(rentalCar.getOriginType());
                row.createCell(10).setCellValue(rentalCar.getSeatingCapacity());
                row.createCell(11).setCellValue(rentalCar.getFuelType());
                row.createCell(12).setCellValue(rentalCar.getCarManufacturer());
                row.createCell(13).setCellValue(rentalCar.getModelYear());
            }

            workbook.write(out);
            return out.toByteArray(); // 엑셀 파일을 바이트 배열로 반환
        }
    }

    // 정비중인 차량 정비완료(렌탈가능)로 수정
    public void updateRentalCarsStatusToAvailableById(Integer carCode) {
        rentalCarsMapper.updateRentalCarsStatusToAvailableById(carCode);
    }

}
