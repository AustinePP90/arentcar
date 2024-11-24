package com.apple.arentcar.controller;

import com.apple.arentcar.model.CarTypes;
import com.apple.arentcar.service.CarsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/arentcar")
public class CarsController {

    @Autowired
    private CarsService carsService;

    @GetMapping("/manager/cars")
    public List<CarTypes> getAllCars() { return carsService.getAllCars(); }

    @GetMapping("/manager/cars/{carTypeCode}")
    public ResponseEntity<CarTypes> getCarsById(@PathVariable Integer carTypeCode) {
        CarTypes carTypes = carsService.getCarsById(carTypeCode);
        if (carTypes != null) {
            return ResponseEntity.ok(carTypes);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 차종 조회 및 페이지네이션(검색 기능 포함)
    @GetMapping("/manager/cars/paged")
    public ResponseEntity<List<CarTypes>> getCarsWithPaging(
                                             @RequestParam int pageSize,
                                             @RequestParam int pageNumber,
                                             @RequestParam(required = false) String carTypeName) {
        List<CarTypes> carTypes;
        if (carTypeName != null && !carTypeName.isEmpty()) {
            carTypes = carsService.getCarsByNameWithPaging(carTypeName, pageSize, pageNumber);
        } else {
            carTypes = carsService.getCarsWithPaging(pageSize, pageNumber);
        }
        return ResponseEntity.ok(carTypes);
    }

    // 전체 차종 수 조회(검색 기능 포함)
    @GetMapping("/manager/cars/count")
    public ResponseEntity<Integer> getTotalCarsCount(@RequestParam(required = false) String carTypeName) {
        int count;
        if (carTypeName != null && !carTypeName.isEmpty()) {
            count = carsService.countCarsByName(carTypeName);
        } else {
            count = carsService.countAllCars();
        }
        return ResponseEntity.ok(count);
    }

    // 차종 등록
    @PostMapping("/manager/cars")
    public ResponseEntity<CarTypes> createCars(@RequestBody CarTypes carTypes) {
        CarTypes savedCars = carsService.createCars(carTypes);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCars);
    }

    // 차종 삭제
    @DeleteMapping("/manager/cars/{carTypeCode}")
    public ResponseEntity<Void> deleteCarsById(@PathVariable Integer carTypeCode) {
        carsService.deleteCarsById(carTypeCode);
        return ResponseEntity.noContent().build();
    }

    // 차종 수정
    @PutMapping("/manager/cars/{carTypeCode}")
    public ResponseEntity<Void> updateCarsById(@PathVariable Integer carTypeCode,
                                               @RequestBody CarTypes carTypes) {
        carTypes.setCarTypeCode(carTypeCode);
        carsService.updateCarsById(carTypes);
        return ResponseEntity.noContent().build();
    }

    @Value("${file.upload-dir.arentcar}")
    private String uploadDirectory;

    // 차종 이미지 업로드
    @PostMapping("/manager/cars/image")
    public ResponseEntity<String> uploadCarImage(@RequestParam("file") MultipartFile file) {
        try {
            String originalFilename = file.getOriginalFilename();
            String uniqueFilename = UUID.randomUUID().toString() + "-" + originalFilename;

            Path filePath = Paths.get(uploadDirectory, uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            return ResponseEntity.ok("success");
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("File upload failed!");
        }
    }

}