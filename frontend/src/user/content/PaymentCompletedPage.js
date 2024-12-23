import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import 'user/content/PaymentCompletedPage.css'

const PaymentCompletedPage = () => {
    const location = useLocation();
    const navigator = useNavigate();
    const reservationInfo = location.state;
    const [reservationNumber,setReservationNumber] =useState(0);
    const userName = useSelector((state) => state.userState.userName);

    const addCommaToCurrency = (fee) => {
      if (fee.toString().length > 6) {
          return fee.toString().slice(0, -6) + ',' + fee.toString().slice(-6, -3) + ',' + fee.toString().slice(-3);
      } else if (fee.toString().length < 3) {
          return fee.toString();
      }
      return fee.toString().slice(0, -3) + ',' + fee.toString().slice(-3);
  }
  const handelMypageNavigation = ()=>{
    navigator("/mypage");
  }
  const handelHomeNavigation = ()=>{
    navigator("/");
  }

    useEffect(() => {
        const getReservationNumber = async () => {
            try {
              const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/arentcar/user/cars/reservation/number`,
              );
              if (response.data) {
                setReservationNumber(response.data);
              }
            } catch (error) {
              if (axios.isCancel(error)) {
                console.log('Request canceled:', error.message);
              } else {
                console.error('There was an error fetching the cars!', error);
              }
            }
          };
          getReservationNumber();
    }, [])

    return (
        <div className='payment-completed-page-wrap'>
            <div className='payment-completed-page-header'>
                <h2 className='payment-completed-page-title'>예약 완료</h2>
            </div>
            <div className='payment-completed-page-body'>
                <div className='payment-completed-page-item'><span>예약번호</span><span>{reservationNumber}</span></div>
                <div className='payment-completed-page-item'><span>예약자명</span><span>{userName}</span></div>
                <div className='payment-completed-page-item'><span>차량명</span><span>{reservationInfo.car_type_name}</span></div>
                <div className='payment-completed-page-item'><span>예약기간</span><span>{reservationInfo.rental_date.substring(0, 4) + '.' + reservationInfo.rental_date.substring(4, 6) + '.' + reservationInfo.rental_date.substring(6)} ~ {reservationInfo.return_date.substring(0, 4) + '.' + reservationInfo.return_date.substring(4, 6) + '.' + reservationInfo.return_date.substring(6)}</span></div>
                <div className='payment-completed-page-item'><span>요금</span><span>{addCommaToCurrency(reservationInfo.payment_amount)}원</span></div>
            </div>
            <div className='payment-completed-page-button-wrap'>
              <button className='payment-completed-page-button' onClick={handelMypageNavigation}>예약정보 확인</button>
              <button className='payment-completed-page-button' onClick={handelHomeNavigation}>홈으로</button>
            </div>
        </div>
    );
}

export default PaymentCompletedPage;