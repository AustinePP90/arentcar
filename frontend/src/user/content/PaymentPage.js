import axios from 'axios';
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import 'user/content/PaymentPage.css';
import * as PortOne from "@portone/browser-sdk/v2";
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reservationInfo = location.state;
  const isUserName = useSelector((state) => state.userState.userName);
  const userCame = useSelector((state) => state.userState.userCode);
  const currentDate = new Date();

  const params = {
    userCode: userCame,
    carCode: reservationInfo.car_code,
    rentalLocation: reservationInfo.branch_name,
    rentalDate: reservationInfo.rental_date,
    rentalTime: `${reservationInfo.rental_time}00`,
    returnLocation: reservationInfo.branch_name,
    returnDate: reservationInfo.return_date,
    returnTime: `${reservationInfo.return_time}00`,
    insuranceType: reservationInfo.insurance_type,
    paymentCategory: '1',
    paymentType: '01',
    paymentAmount: reservationInfo.payment_amount,
    reservationDate: currentDate.getFullYear().toString()+(currentDate.getMonth()+1).toString().padStart(2,"0")+currentDate.getDate().toString().padStart(2,"0"),
    paymentDate: currentDate.getFullYear().toString()+(currentDate.getMonth()+1).toString().padStart(2,"0")+currentDate.getDate().toString().padStart(2,"0")
  }

  const requestPayment = async () => {
    // UUID 생성: crypto.randomUUID가 있으면 사용하고, 없으면 uuidv4를 사용
    const generateUUID = () =>
      (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
        ? crypto.randomUUID()
        : uuidv4();
  
    const paymentId = `payment-${generateUUID()}`;
  
    const response = await PortOne.requestPayment({
      storeId: "store-56b88bd8-5068-4c9b-a6d7-7144ba4155ce", // Store ID
      paymentId, // 고유 결제 ID
      orderName: reservationInfo.car_type_name, // 결제 상품명
      totalAmount: 100, // 결제 금액
      currency: "KRW", // 올바른 통화 코드
      channelKey: "channel-key-7c932c01-1547-4919-b86d-e0542a9b0b8b", // 채널 키
      payMethod: "CARD", // 결제 방식
    });
  
    if (response.code !== undefined) {
      return alert(response.message);
    } else {
      InsertUserReservation();
      updateCarStatus();
      navigate('/PaymentCompletedPage', {
        state: { ...reservationInfo },
      });
    }
  };

  //  const  requestPayment = async () => {
  //   const response = await PortOne.requestPayment(
  //     {
  //       storeId: "store-56b88bd8-5068-4c9b-a6d7-7144ba4155ce", // Store ID
  //       paymentId: `payment-${crypto.randomUUID()}`, // 고유 결제 ID
  //       orderName: reservationInfo.car_type_name, // 결제 상품명
  //       totalAmount: 100, // 결제 금액
  //       currency: "KRW", // 올바른 통화 코드
  //       channelKey: "channel-key-7c932c01-1547-4919-b86d-e0542a9b0b8b", // 채널 키
  //       payMethod: "CARD", // 결제 방식
  //     });
  //     if (response.code !== undefined) {
  //       return alert(response.message);
  //     }else{
  //       console.log("결제 성공 데이터:", response);
  //         InsertUserReservation();
  //         updateCarStatus();
  //         alert("결제가 성공적으로 완료되었습니다!");
  //         navigate('/PaymentCompletedPage',{
  //           state: {...reservationInfo}
  //         });
  //     }
  // };
  

  const InsertUserReservation = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/arentcar/user/cars/reservation`,
        null,
        { params: params }

      );
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
      } else {
        console.error('There was an error fetching the cars!', error);
      }
    }
  };
  const updateCarStatus = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/arentcar/user/cars/reservation/updatecar/status`,
        { car_code: reservationInfo.car_code },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        console.error('Request error:', error.request);
      } else {
        console.error('Error', error.message);
      }
    }
  };

  const addCommaToCurrency = (fee) => {
    if (fee.toString().length > 6) {
        return fee.toString().slice(0, -6) + ',' + fee.toString().slice(-6, -3) + ',' + fee.toString().slice(-3);
    } else if (fee.toString().length < 3) {
        return fee.toString();
    }
    return fee.toString().slice(0, -3) + ',' + fee.toString().slice(-3);
}

useEffect(()=>{
  console.log(params);
},[params])

  return (
    <div className='payment-page-wrap'>
      <div className='payment-page-title-wrap'>
        <h3>결제</h3>
      </div>
      <div className='payment-page-body-wrap'>
      <div className='payment-page-content-wrap'>
        <div className='payment-page-content-reservation-info'>
          <div className='payment-page-content-reservation-info-header'>
            <span>예약정보</span>
            <span>{reservationInfo.car_type_name}</span>
          </div>
          <div className='payment-page-content-reservation-info-content'>
            <div className='payment-page-content-reservation-info-content-item'>
              <span>예약자</span>
              <span>{`${isUserName}`}</span>
            </div>
            <div className='payment-page-content-reservation-info-content-item'>
              <span>대여기간</span>
              <div className='payment-page-content-reservation-info-content-item-rental-info'>
                <span>{`대여 ${reservationInfo.rental_date.substring(0, 4)}/${reservationInfo.rental_date.substring(4, 6)}/${reservationInfo.rental_date.substring(6)} ${reservationInfo.branch_name}`}</span>
                <span>{`반납 ${reservationInfo.return_date.substring(0, 4)}/${reservationInfo.return_date.substring(4, 6)}/${reservationInfo.return_date.substring(6)} ${reservationInfo.branch_name}`}</span>
              </div>
            </div>
          </div>
        </div>
        <div className='payment-page-content-discount-info'>
          <div className='payment-page-content-discount-info-header'>
            <span>할인정보</span>
          </div>
          <div className='payment-page-content-discount-info-content'>
            <div className='payment-page-content-discount-info-content-item'>
              <span>회원 할인({reservationInfo.rental_discount_rate}%)</span>
              <span>{addCommaToCurrency(reservationInfo.discount_fee)}원</span>
            </div>
          </div>
        </div>
      </div>
      <div className='payment-page-side-wrap' >
      <div className='payment-page-content-payment-info-content-item'>
              <span>차량 대여 요금</span>
              <span>{addCommaToCurrency(reservationInfo.rental_rate)}원</span>
            </div>
            <div className='payment-page-content-payment-info-content-item'>
              <span>차량 보험료</span>
              <span>{addCommaToCurrency(reservationInfo.insurance_type === '01' ?  '15000':'20000')}원</span>
            </div>
            <div className='payment-page-content-payment-info-content-item'>
              <span>할인 금액</span>
              <span>-{addCommaToCurrency(reservationInfo.discount_fee)}원</span>
            </div>
            <div className='payment-page-content-payment-info-total-rate'>
              <span>결제 금액</span>
              <span>{addCommaToCurrency(reservationInfo.payment_amount)}원</span>
            </div>
        <button className='payment-page-side-payment-button' onClick={() => InsertUserReservation()}>결제하기</button>
      </div>
      </div>

      
    </div>
  );
}

export default PaymentPage;