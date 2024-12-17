package com.apple.arentcar.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MyReservationsDetailResponseDTO {
    private String reservationCode;          // 예약 ID
    private String reservationDate;          // 예약일
    private String userName;                 // 예약자 성함
    private String userPhoneNumber;          // 연락처
    private String reservationStatus;        // 예약 상태
    private String carTypeName;              // 차량명
    private String modelYear;                // 연식
    private String seatingCapacity;          // 인승
    private String fuelType;                 // 연료
    private String licenseRestriction;       // 나이·면허 제한
    private String speedLimit;               // 속도 제한
    private String rentalDate;               // 대여일
    private String rentalTime;               // 대여 시간
    private String rentalBranchName;         // 대여지점명
    private String rentalBranchAddress;      // 대여지점 주소
    private String rentalBranchPhoneNumber;  // 대여지점 연락처
    private String returnDate;               // 반납일
    private String returnTime;               // 반납 시간
    private String returnBranchName;         // 반납지점명
    private String returnBranchAddress;      // 반납지점 주소
    private String returnBranchPhoneNumber;  // 반납지점 연락처
    private String insuranceType;            // 보험 유형
    private String paymentDate;              // 결제일
    private String paymentStatus;            // 결제 상태
    private String paymentAmount;            // 결제 금액
    private String paymentCategory;          // 결제 방식
    private String paymentType;              // 결제 세부 방식
}