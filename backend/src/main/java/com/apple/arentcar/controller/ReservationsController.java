package com.apple.arentcar.controller;

import com.apple.arentcar.dto.*;
import com.apple.arentcar.service.ReservationsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/arentcar")
public class ReservationsController {

    @Autowired
    private ReservationsService reservationsService;

    @GetMapping("/manager/reservations")
    public ResponseEntity<List<ReservationsResponseDTO>> getReservations(
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) String rentalLocationName,
            @RequestParam(required = false) String rentalDate,
            @RequestParam int pageNumber,
            @RequestParam int pageSize) {

        pageNumber = Math.max(pageNumber, 1);
        int offset = (pageNumber - 1) * pageSize;

        ReservationsSearchRequestDTO requestDTO = new ReservationsSearchRequestDTO();
        requestDTO.setUserName(userName);
        requestDTO.setRentalLocationName(rentalLocationName);
        requestDTO.setRentalDate(rentalDate);
        requestDTO.setOffset(offset);
        requestDTO.setPageSize(pageSize);

        List<ReservationsResponseDTO> reservations = reservationsService.getReservations(requestDTO);

        if (reservations.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(reservations);
    }
    @GetMapping("/manager/reservations/count")
    public ResponseEntity<Integer> getTotalReservationsCount(
        @RequestParam(required = false) String rentalLocationName,
        @RequestParam(required = false) String rentalDate,
        @RequestParam(required = false) String userName) {
            int count;

            // 조건별 조회
            if ((rentalLocationName != null && !rentalLocationName.isEmpty()) ||
                    (rentalDate != null && !rentalDate.isEmpty()) ||
                    (userName != null && !userName.isEmpty())) {

                ReservationsSearchRequestDTO searchRequestDTO = new ReservationsSearchRequestDTO();
                searchRequestDTO.setRentalLocationName(rentalLocationName);
                searchRequestDTO.setRentalDate(rentalDate);
                searchRequestDTO.setUserName(userName);

                count = reservationsService.countByConditions(searchRequestDTO);
            } else {
                count = reservationsService.countAllReservations();
            }

            return ResponseEntity.ok(count);
    }
    @GetMapping("/manager/reservations/detail/{reservationCode}")
    public ReservationDetailDTO getReservationDetailById(@PathVariable("reservationCode") String reservationCode) {
        return reservationsService.getReservationDetailById(reservationCode);
    }

    @PutMapping("/manager/reservations/carreturn/{reservationCode}")
    public ResponseEntity<Void> updateCarStatusAndReservationStatus(
            @PathVariable String reservationCode,
            @RequestBody Map<String, Object> carReturnRequest) {

        reservationsService.updateCarStatusAndReservationStatus(reservationCode, carReturnRequest);

        return ResponseEntity.noContent().build();
    }
    @PutMapping("/manager/reservations/cancel/{reservationCode}")
    public ResponseEntity<Void> updateReservationAndCarStatus(
            @PathVariable String reservationCode,
            @RequestBody Map<String, Object> reservationStatusRequest) {

        reservationsService.updateReservationAndCarStatus(reservationCode, reservationStatusRequest);

        return ResponseEntity.noContent().build();
    }
    @GetMapping("/manager/myreservations")
    public ResponseEntity<List<MyReservationsResponseDTO>> findReservationsByUserCode(
            @RequestParam String userCode,
            @RequestParam(required = false) String rentalLocationName,
            @RequestParam(required = false) String reservationDate,
            @RequestParam int pageNumber,
            @RequestParam int pageSize
    ) {
        pageNumber = Math.max(pageNumber, 1);
        int offset = (pageNumber - 1) * pageSize;

        MyReservationsRequestDTO myrequestDTO = new MyReservationsRequestDTO();

        myrequestDTO.setUserCode(userCode);
        myrequestDTO.setReservationDate(reservationDate);
        myrequestDTO.setRentalLocationName(rentalLocationName);
        myrequestDTO.setOffset(offset);
        myrequestDTO.setPageSize(pageSize);

        List<MyReservationsResponseDTO> myreservations = reservationsService.findReservationsByUserCode(myrequestDTO);
        return ResponseEntity.ok(myreservations);
    }
    @GetMapping("/manager/myreservations/count")
    public ResponseEntity<Integer> getTotalMyReservationsCount(
            @RequestParam String userCode,
            @RequestParam(required = false) String rentalLocationName,
            @RequestParam(required = false) String reservationDate) {

        int count;
        if ((rentalLocationName != null && !rentalLocationName.isEmpty()) ||
                (reservationDate != null && !reservationDate.isEmpty())) {
            MyReservationsRequestDTO SearchRequestDTO = new MyReservationsRequestDTO();
            SearchRequestDTO.setRentalLocationName(rentalLocationName);
            SearchRequestDTO.setReservationDate(reservationDate);
            SearchRequestDTO.setUserCode(userCode);

            count = reservationsService.countMyReservations(SearchRequestDTO);
        } else {
            count = reservationsService.countAllMyReservations(userCode);
        }
        return ResponseEntity.ok(count);
    }
    @GetMapping("/manager/myreservations/detail")
    public MyReservationsDetailResponseDTO getReservationDetailByUserAndCode(
            @RequestParam("reservationCode") String reservationCode,
            @RequestParam("userCode") String userCode) {
        return reservationsService.getReservationDetailByUserAndCode(reservationCode, userCode);
    }
    @PutMapping("/manager/myreservations/cancel")
    public ResponseEntity<String> cancelMyReservation(
            @RequestParam("reservationCode") String reservationCode,
            @RequestParam("userCode") String userCode,
            @RequestParam("reservationStatus") String reservationStatus,
            @RequestParam("paymentStatus") String paymentStatus,
            @RequestParam("carStatus") String carStatus) {

        // DTO 생성
        ReservationStatusRequestDTO mypagerequestDTO = new ReservationStatusRequestDTO(
                reservationStatus, paymentStatus, carStatus
        );

        reservationsService.cancelMyReservation(reservationCode, userCode, mypagerequestDTO);

        return ResponseEntity.noContent().build();
    }

}