package com.apple.arentcar.mapper;

import com.apple.arentcar.dto.ReservationsSearchRequestDTO;
import com.apple.arentcar.dto.ReservationsResponseDTO;
import com.apple.arentcar.model.Reservations;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ReservationsMapper {


    List<ReservationsResponseDTO> getReservations(ReservationsSearchRequestDTO requestDTO);

//    List<ReservationsResponseDTO> getFilteredReservations(ReservationRequestDTO requestDTO);

    void createReservation(Reservations reservation);

    void updateReservationById(Reservations reservation);

    void deleteReservationById(@Param("reservationCode") Integer reservationCode);


}