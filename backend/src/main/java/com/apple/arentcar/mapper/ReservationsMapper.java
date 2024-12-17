package com.apple.arentcar.mapper;

import com.apple.arentcar.dto.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ReservationsMapper {
    List<ReservationsResponseDTO> getReservations(ReservationsSearchRequestDTO requestDTO);

    int countByConditions(ReservationsSearchRequestDTO searchRequestDTO);

    int countAllReservations();

    ReservationDetailDTO getReservationsDetailById(@Param("reservationCode") String reservationCode);

        void updateCarStatus(@Param("reservationCode") String reservationCode,
                             @Param("carStatus") String carStatus);
        void ReservationStatusUpdate(@Param("reservationCode")String reservationCode,
                               @Param("reservationStatus")String reservationStatus);

    void updateReservationStatus(@Param("reservationCode") String reservationCode,
                                 @Param("reservationStatus") String reservationStatus,
                                 @Param("paymentStatus") String paymentStatus);

    void updateRentCarStatus(@Param("reservationCode") String reservationCode,
                         @Param("carStatus") String carStatus);

    List<MyReservationsResponseDTO> findReservationsByUserCode(MyReservationsRequestDTO myrequestDTO);

    int countMyReservations(MyReservationsRequestDTO SearchRequestDTO);

    int countAllMyReservations(String userCode);

    MyReservationsDetailResponseDTO getReservationDetailByUserAndCode(@Param("reservationCode") String reservationCode, @Param("userCode") String userCode);

    void updateReservationAndPaymentStatus(
            @Param("reservationCode") String reservationCode, @Param("userCode") String userCode,
            @Param("reservationStatus") String reservationStatus, @Param("paymentStatus") String paymentStatus);

    void updateCarStatusForCancellation(
            @Param("reservationCode") String reservationCode, @Param("userCode") String userCode, @Param("carStatus") String carStatus);
}