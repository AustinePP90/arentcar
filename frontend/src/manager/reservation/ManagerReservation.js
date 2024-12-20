import React, { useState, useEffect } from "react";
import axios from "axios";
import "manager/reservation/ManagerReservation.css";
import { refreshAccessToken, handleAdminLogout, formatDate, formatTime, formatPhone } from "common/Common";
import { useSelector } from "react-redux";

const ManagerReservation = ({ onClick }) => {
  const isLoginState = useSelector((state) => state.adminState.loginState);
  const [branchNames, setBranchNames] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [reservationDate, setReservationDate] = useState("");
  const [reserverName, setReserverName] = useState("");
  const [isPopUp, setIsPopUp] = useState(false);
  const [pageNumber, setPageNumber] = useState(1); // 현재 페이지 번호
  const pageSize = 10; // 한 페이지에 보여줄 데이터 개수
  const [totalCount, setTotalCount] = useState(0); // 전체 페이지 수
  const [reservations, setReservations] = useState([]);
  const [reservationDetails, setReservationDetails] = useState([]);
  const [columnDefs] = useState([
    { titlename: "예약 ID", field: "reservation_code", width: 100, align: "center" },
    { titlename: "성함", field: "user_name", width: 100, align: "center" },
    { titlename: "차량번호", field: "car_number", width: 100, align: "center" },
    { titlename: "차량명", field: "car_type_name", width: 190, align: "center" },
    { titlename: "대여지점", field: "rental_location_name", width: 100, align: "center" },
    { titlename: "대여일", field: "rental_date", width: 120, align: "center" },
    { titlename: "반납일", field: "return_date", width: 120, align: "center" },
    { titlename: "차량상태", field: "car_status", width: 100, align: "center" },
    { titlename: "상세", field: "", width: 100, align: "center" },
  ]);

  // 렌더링
  useEffect(() => {
    if (!isLoginState) {
      alert("로그인이 필요합니다.");
      return;
    }
    pageingReservations();
    getTotalCount();
  }, [pageNumber,reservationDetails]);

  useEffect(() => {
    if (!isLoginState) {
      return;
    }
    handleFetchBranchNames();
  },[]);

  // YYYY-MM-DD → YYYYMMDD 변환 함수
  const formatDateToCompact = (date) => {
    if (!date) {
      return ""; // 날짜가 없으면 빈 문자열 반환
    }
    return date.replace(/-/g, ""); // "-"를 제거하여 반환
  };
  const formatNumberWithCommas = (number) => {
    if (!number && number !== 0) {
      return ""; // 숫자가 없으면 빈 문자열 반환
    }

    // 숫자를 문자열로 변환 후 정규식 사용 + 원(₩) 추가
    return `${number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원`;
  };

  const pageingReservations = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await getReservations(token);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        try {
          const newToken = await refreshAccessToken();
          await getReservations(newToken);
        } catch (error) {
          alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
          handleAdminLogout();
        }
      } else {
        console.error('There was an error fetching the menus pageing!', error);
      }
    }
  };

  const getReservations = async (token) => {
    const params = {
      pageSize,
      pageNumber,
    };

    // 조건이 참일 때만 필드 추가
    if (selectedBranch && selectedBranch.trim() !== '') {
      params.rentalLocationName = selectedBranch;
    }
    if (reservationDate) {
      params.rentalDate = formatDateToCompact(reservationDate);
    }
    if (reserverName && reserverName.trim() !== '') {
      params.userName = reserverName;
    }

    const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/reservations`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      });

    if (response.data && response.data.length > 0) {
      setReservations(response.data); // 데이터가 있는 경우
    } else {
      setReservations([]); // 데이터가 없는 경우 빈 배열로 설정
    }
  };

  const getTotalCount = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await getCount(token);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        try {
          const newToken = await refreshAccessToken();
          await getCount(newToken);
        } catch (error) {
          alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
          handleAdminLogout();
        }
      } else {
        console.error('There was an error fetching the Reservations count!', error);
      }
    }
  };

  const getCount = async (token) => {
    const params = {
      ...((selectedBranch && { rentalLocationName: selectedBranch }) || {}),
      ...((reservationDate && { rentalDate: reservationDate }) || {}),
      ...((reserverName && { userName: reserverName }) || {}),
    };

    const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/reservations/count`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      });

    if (typeof response.data === 'number') {
      setTotalCount(response.data);
    } else {
      console.error('Unexpected response:', response.data);
    }
  };

  // 지점명 데이터 가져오기
  const handleFetchBranchNames = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/user/branchs`);
      if (response.data) {
        setBranchNames(response.data.map((branch) => branch.branch_name));
      }
    } catch (error) {
      console.error("There was an error fetching the branches", error);
    }
  };

  const fetchReservationDetail = async (reservationCode) => {
    try {
      const token = localStorage.getItem("accessToken");
      await getreservationDetails(token, reservationCode);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        try {
          const newToken = await refreshAccessToken();
          await getreservationDetails(newToken, reservationCode);
        } catch (error) {
          alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
          handleAdminLogout();
        }
      } else {
        console.error("There was an error fetching the reservation details!", error);
      }
    }
  };

  const getreservationDetails = async (token, reservationCode) => {
    if (!reservationCode) {
      return;
    }
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/arentcar/manager/reservations/detail/${reservationCode}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    if (response.data) {
      setReservationDetails(response.data);
    }
  };

  const handleDetailClick = (reservationCode) => {
    if (!reservationCode) {
      return;
    }
    setIsPopUp(true);
    fetchReservationDetail(reservationCode);
  };

  const handlePopupCloseClick = () => {
    setIsPopUp(false);
    setReservationDetails([]);
  };
  // 검색 조건 변경 후 초기화 코드
  const handleSearchClick = async () => {
    setPageNumber(1); // 검색 조건 변경 시 페이지 번호를 1로 초기화
    await pageingReservations(); // 데이터 다시 로드
    await getTotalCount(); // 총 데이터 개수 다시 로드
  };

  const handlePageChange = (newPageNumber) => {
    setPageNumber(newPageNumber);
  };

      const handleReservationCancel = async (reservationCode) => {
        // 예약 취소 여부 확인
        const reservationCancelConfirmed = window.confirm("예약을 취소하시겠습니까?");
        if (!reservationCancelConfirmed) {
          alert("예약 취소가 취소되었습니다.");
          return;
        }

        try {
          // reservationDetails에서 현재 예약 상태와 차량 상태 확인
          if (
            reservationDetails.reservation_code === reservationCode &&
            reservationDetails.reservation_status === "이용완료" && // 예약 상태가 '이용완료'
            reservationDetails.car_status === "정비중"             // 차량 상태가 '정비중'
          ) {
            alert("이미 이용 완료된 예약내역입니다.");
            return;
          } else if (
            reservationDetails.reservation_code === reservationCode &&
            reservationDetails.reservation_status === "예약취소" && // 예약 상태가 '예약취소'
            reservationDetails.payment_status === "결제취소" &&     // 결제 상태가 '결제취소'
            reservationDetails.car_status === "렌탈가능"           // 차량 상태가 '렌탈가능'
          ) {
            alert("이미 예약 취소된 예약내역입니다.");
            return;
          }
          const token = localStorage.getItem("accessToken"); // 토큰 가져오기
          const requestBody = { 
            reservationStatus: "2", // 예약 상태: '취소'
            paymentStatus: "2",     // 결제 상태: '취소' 
            carStatus: "01"          // 차량 상태: '렌탈가능'
        };

          // 예약 상태 업데이트 API 호출
          await axios.put(
            `${process.env.REACT_APP_API_URL}/arentcar/manager/reservations/cancel/${reservationCode}`,
            requestBody,
            {
              headers: {
                Authorization: `Bearer ${token}`, // 인증 헤더
              },
              withCredentials: true, // 쿠키 포함
            }
          );

          alert("예약이 취소되었습니다."); // 성공 메시지
          // 예약 목록 새로고침 (필요시 구현)
          await fetchReservationDetail(reservationCode);
        } catch (error) {
          if (error.response && error.response.status === 403) {
            try {
              // 토큰 갱신 처리
              const newToken = await refreshAccessToken();
              localStorage.setItem("accessToken", newToken); // 갱신된 토큰 저장
              // 갱신된 토큰으로 재시도
              await handleReservationCancel(reservationCode);
            } catch (error) {
              alert("인증이 만료되었습니다. 다시 로그인 해주세요."); // 인증 만료 알림
              handleAdminLogout(); // 로그아웃 처리
            }
          } else {
            alert("예약 취소에 실패했습니다."); // 사용자 알림
          }
        }
      };

  const handleCarReturn = async (reservationCode) => {
    // 반납 여부 확인
    const carReturnConfirmed = window.confirm("차량을 반납 처리 하겠습니까?");
    if (!carReturnConfirmed) {
      alert("반납이 취소되었습니다.");
      return;
    }

    try {
      if (
      reservationDetails.reservation_code === reservationCode &&
      reservationDetails.reservation_status === "이용완료" && // 예약 상태가 '이용완료'
      reservationDetails.car_status === "정비중"             // 차량 상태가 '정비중'
    ) {
      alert("이미 반납 처리된 차량입니다.");
      return;
    } else if (
      reservationDetails.reservation_code === reservationCode &&
      reservationDetails.reservation_status === "예약취소" && // 예약 상태가 '예약취소'
      reservationDetails.payment_status === "결제취소" &&     // 결제 상태가 '결제취소'
      reservationDetails.car_status === "렌탈가능"           // 차량 상태가 '렌탈가능'
    ) {
      alert("예약이 취소된 차량입니다.");
      return;
    }
      const token = localStorage.getItem("accessToken"); // 토큰 가져오기
      const requestBody = { 
        carStatus: "03",       // 차량 상태: '정비중'
        reservationStatus: "3" // 예약 상태: '이용완료'
      }; 

      // 차량 상태 업데이트 API 호출
      await axios.put(`${process.env.REACT_APP_API_URL}/arentcar/manager/reservations/carreturn/${reservationCode}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`, // 인증 헤더
          },
          withCredentials: true, // 쿠키 포함
        }
      );
      alert("차량 상태가 '정비중'으로 업데이트되었습니다."); // 성공 메시지
      await fetchReservationDetail(reservationCode); // 새로고침
    } catch (error) {
      if (error.response && error.response.status === 403) {
        try {
          // 토큰 갱신 처리
          const newToken = await refreshAccessToken();
          localStorage.setItem("accessToken", newToken); // 갱신된 토큰 저장

          // 갱신된 토큰으로 재시도
          await handleCarReturn(reservationCode);
        } catch (error) {
          alert("인증이 만료되었습니다. 다시 로그인 해주세요."); // 인증 만료 알림
          handleAdminLogout(); // 로그아웃 처리
        }
      } else {
        alert("차량 상태 업데이트에 실패했습니다."); // 사용자 알림
      }
    }
  };

  const handleCloseClick = () => {
    if (onClick) {
      onClick();
    }
  };

  let totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;

  return (
    <div className="manager-reservation-wrap">
      {/* 헤더 */}
      <div className="manager-reservation-header-wrap">
        <div className="manager-reservation-title-wrap">
          <div className="manager-reservation-title manager-title">● 예약현황</div>
        </div>
        <div className="manager-reservation-controls-wrap">
          <div className="manager-reservation-controls-search-wrap">
            <input
              type="text"
              placeholder="예약자 성함"
              value={reserverName}
              onChange={(e) => setReserverName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
              className="manager-reservation-text-input"
            />

            <select
              className="manager-reservation-select"
              value={selectedBranch} // 선택된 값
              onChange={(e) => setSelectedBranch(e.target.value)} // 선택값 변경
            >
              <option value="">대여지점</option>
              {branchNames.map((name, index) => (
                <option key={index} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={reservationDate}
              onChange={(e) => setReservationDate(e.target.value)}
              className="manager-reservation-date-input"
            />
            <button
              onClick={handleSearchClick}
              className="manager-reservation-button-search manager-button manager-button-search"
            >
              검색
            </button>
            <span>[검색건수 : {totalCount}건]</span>
          </div>
          <div className="manager-reservation-controls-close-wrap">
            <button className='manager-button manager-reservation-button-close' onClick={() => handleCloseClick()}>
              닫기
            </button>
          </div>
        </div>
      </div>

      {/* 테이블 헤더 */}
      <div className="manager-reservation-content-header-row-wrap">
        {columnDefs.map((title, index) => (
          <div
            key={index}
            className="manager-reservation-content-header-column manager-head-column"
            style={{
              width: `${title.width}px`,
              textAlign: title.align || "center",
            }}
          >
            {title.titlename}
          </div>
        ))}
      </div>

      {/* 테이블 데이터 */}
      <div className="manager-reservation-content-list-wrap">
        {reservations.length > 0 ? (
          reservations.map((reservation, index) => (
            <div key={index} className="manager-reservation-content-item">
              {columnDefs.map((column, colIndex) => (
                <div
                  key={colIndex}
                  className="manager-reservation-content-column manager-row-column"
                  style={{
                    ...(column.field === "" && {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }),
                    width: `${column.width}px`,
                    textAlign: column.align || "center",
                  }}
                >
                  {column.field === "" ? (
                    <button
                      className="manager-reservation-content-button-detail manager-button"
                      onClick={() => handleDetailClick(reservation.reservation_code)}
                    >
                      상세
                    </button>
                  ) : (
                    column.field === 'rental_date' ? (
                      formatDate(reservation[column.field])
                    ) :
                      column.field === 'return_date' ? (
                        formatDate(reservation[column.field])
                      ) :
                        reservation[column.field]
                  )}
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="manager-reservation-content-no-data">
            조건에 맞는 예약 데이터가 없습니다.
          </div>
        )}
      </div>
      <div className="manager-reservation-pagination-wrap flex-align-center">
        <button
          className="manager-reservation-pagination-button manager-button"
          style={{ color: pageNumber === 1 ? "#aaa" : "rgb(38, 49, 155)" }}
          onClick={() => handlePageChange(pageNumber - 1)}
          disabled={pageNumber === 1}
        >
          이전
        </button>
        <div className="manager-reservation-pagination-info">
          {pageNumber} / {totalPages}
        </div>
        <button
          className="manager-reservation-pagination-button manager-button"
          style={{ color: pageNumber === totalPages ? "#aaa" : "rgb(38, 49, 155)" }}
          onClick={() => handlePageChange(pageNumber + 1)}
          disabled={pageNumber === totalPages}
        >
          다음
        </button>
      </div>
      {/* 팝업 */}
      {isPopUp && (
        <div className="manager-reservation-popup manager-popup">
          <div className="manager-reservation-content-popup-wrap">
            <div className="manager-reservation-content-popup-header-wrap">
              <div className="manager-popup-title">● 예약상세</div>
              <button
                className="manager-button manager-button-close"
                onClick={handlePopupCloseClick}
              >
                닫기
              </button>
            </div>

            {/* 예약 ID */}
            <div className="manager-reservation-popup-high-reservation-id">
              <label>예약ID : </label>
              <span>{reservationDetails.reservation_code}</span>
            </div>

            {/* 고객정보 */}
            <div className="manager-reservation-popup-section">
              <div className="manager-reservation-popup-section-title">고객정보</div>
              <div className="manager-reservation-popup-field-row">
                <label>성명 : </label>
                <span>{reservationDetails.user_name}</span>
              </div>
              <div className="manager-reservation-popup-field-row">
                <label>생년월일 : </label>
                <span>{formatDate(reservationDetails.user_birth_date)}</span>
                <label>연락처 : </label>
                <span>{formatPhone(reservationDetails.user_phone_number)}</span>
              </div>
              <div className="manager-reservation-popup-field-row">
                <label>이메일 : </label>
                <span>{reservationDetails.user_email}</span>
              </div>
              <div className="manager-reservation-popup-field-row">
                <label>운전면허증 : </label>
                <span>{reservationDetails.driver_license_number || "면허정보 없음"}</span>
                </div>
            </div>

            {/* 예약정보 */}
            <div className="manager-reservation-popup-section">
              <div className="manager-reservation-popup-section-title">예약정보</div>
              <div className="manager-reservation-popup-field-row">
                <label>예약ID : </label>
                <span>{reservationDetails.reservation_code}</span>
                <label>예약일 : </label>
                <span>{formatDate(reservationDetails?.reservation_date)}</span>
              </div>
              <div className="manager-reservation-popup-field-row">
                <label>차량번호 : </label>
                <span>{reservationDetails.car_number}</span>
                <label>차량명 : </label>
                <span>{reservationDetails.car_type_name}</span>
              </div>
              <div className="manager-reservation-popup-field-row">
                <label>연식 : </label>
                <span>{reservationDetails.model_year}</span>
                <label>연료 : </label>
                <span>{reservationDetails.fuel_type}</span>
              </div>
              <div className="manager-reservation-popup-field-row">
                <label>대여일시 : </label>
                <span>{formatDate(reservationDetails.rental_date)}{' '}{formatTime(reservationDetails.rental_time)}</span>
                <label>대여지점 : </label>
                <span>{reservationDetails.rental_location_name}</span>
              </div>
              <div className="manager-reservation-popup-field-row">
                <label>반납일시 : </label>
                <span>{formatDate(reservationDetails.return_date)}{' '}{formatTime(reservationDetails.return_time)}</span>
                <label>반납지점 : </label>
                <span>{reservationDetails.return_location_name}</span>
              </div>
              <div className="manager-reservation-popup-field-row">
                <label>보험 : </label>
                <span>{reservationDetails.insurance_name}</span>
              </div>
              <div className="manager-reservation-popup-field-row">
                <label>예약상태 : </label>
                <span>{reservationDetails.reservation_status}</span>
                <label>차량상태 : </label>
                <span>{reservationDetails.car_status}</span>
              </div>
            </div>
            {/* 결제정보 */}
            <div className="manager-reservation-popup-section">
              <div className="manager-reservation-popup-section-title">결제정보</div>
              <div className="manager-reservation-popup-field-row">
                <label>결제방식 : </label>
                <span>{reservationDetails.payment_category}</span>
                <label>결제수단 : </label>
                <span>{reservationDetails.payment_type}</span>
              </div>
              <div className="manager-reservation-popup-field-row">
                <label>결제금액 : </label>
                <span>{formatNumberWithCommas(reservationDetails?.payment_amount) || ""}</span>
                <label>결제일 : </label>
                <span>{formatDate(reservationDetails?.payment_date) || "결제일 없음"}</span>
              </div>
              <div className="manager-reservation-popup-field-row">
                <label>결제상태 : </label>
                <span>{reservationDetails?.payment_status || "결제 상태 없음"}</span>
              </div>
            </div>

            {/* 액션 버튼 */}

            <div className="manager-reservation-content-popup-footer-wrap">
              <button className="manager-reservation-content-popup-footer-cancel manager-button" onClick={() => handleReservationCancel(reservationDetails.reservation_code)}>예약 취소</button>
              <button
                className="manager-reservation-content-popup-footer-return manager-button"
                onClick={() => { handleCarReturn(reservationDetails.reservation_code); }}>
                차량 반납
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerReservation;
