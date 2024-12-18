package com.apple.arentcar.service;


import com.apple.arentcar.dto.*;
import com.apple.arentcar.mapper.ReservationsMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@Service
public class ReservationsService {
    @Autowired
    private ReservationsMapper reservationsMapper;

    public List<ReservationsResponseDTO> getReservations(ReservationsSearchRequestDTO requestDTO) {
        return reservationsMapper.getReservations(requestDTO);
    }

    public int countByConditions(ReservationsSearchRequestDTO searchRequestDTO) {
        return reservationsMapper.countByConditions(searchRequestDTO);
    }

    public int countAllReservations() {
        return reservationsMapper.countAllReservations();
    }

    public ReservationDetailDTO getReservationDetailById(String reservationCode) {
        return reservationsMapper.getReservationsDetailById(reservationCode);
    }
    public void updateCarStatusAndReservationStatus(String reservationCode, Map<String, Object> carReturnRequest) {

        String carStatus = (String) carReturnRequest.get("carStatus");
        String reservationStatus = (String) carReturnRequest.get("reservationStatus");

        reservationsMapper.updateCarStatus(reservationCode, carStatus);
        reservationsMapper.ReservationStatusUpdate(reservationCode,reservationStatus);
    }

    public void updateReservationAndCarStatus(String reservationCode, Map<String, Object> reservationStatusRequest) {
        // Map에서 데이터 추출
        String reservationStatus = (String) reservationStatusRequest.get("reservationStatus");
        String paymentStatus = (String) reservationStatusRequest.get("paymentStatus");
        String carStatus = (String) reservationStatusRequest.get("carStatus");

        // reservations 테이블 업데이트
        reservationsMapper.updateReservationStatus(reservationCode, reservationStatus, paymentStatus);

        // rental_cars 테이블 업데이트
        reservationsMapper.updateRentCarStatus(reservationCode, carStatus);
    }
    public List<MyReservationsResponseDTO> findReservationsByUserCode(MyReservationsRequestDTO myrequestDTO) {
        return reservationsMapper.findReservationsByUserCode(myrequestDTO);
    }
    public int countMyReservations(MyReservationsRequestDTO SearchRequestDTO) {
        return reservationsMapper.countMyReservations(SearchRequestDTO);
    }

    public int countAllMyReservations(String userCode) {
        return reservationsMapper.countAllMyReservations(userCode);
    }
    public MyReservationsDetailResponseDTO getReservationDetailByUserAndCode(String reservationCode,String userCode) {
        return reservationsMapper.getReservationDetailByUserAndCode(reservationCode, userCode);
    }

    public void cancelMyReservation(String reservationCode, String userCode, ReservationStatusRequestDTO mypagerequestDTO) {

        String reservationStatus = mypagerequestDTO.getReservationStatus();
        String paymentStatus = mypagerequestDTO.getPaymentStatus();
        String carStatus = mypagerequestDTO.getCarStatus();

        reservationsMapper.updateReservationAndPaymentStatus(reservationCode, userCode, reservationStatus, paymentStatus);
        reservationsMapper.updateCarStatusForCancellation(reservationCode, userCode, carStatus);
    }
}