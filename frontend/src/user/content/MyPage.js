  import React, { useEffect, useState } from 'react';
  import 'user/content/MyPage.css';
  import { useNavigate } from "react-router-dom";
  import { useSelector } from 'react-redux';
  import axios from "axios";
  import { refreshAccessToken, handleLogout, formatDate, formatTime, formatPhone } from "common/Common";
  import MyPageDetail from 'user/content/MyPageDetail';

  const MyPage = () => {
    const [isDetailPopup, setIsDetailPopup] = useState(false);
    const isUserName = useSelector((state) => state.userState.userName);
    const userCode = useSelector((state) => state.userState.userCode);
    const isLoginState = useSelector((state) => state.userState.loginState);
    const navigate = useNavigate();
    const [isPopUp, setIsPopUp] = useState(false);
    const [branchNames, setBranchNames] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [selectedReservationDate, setSelcetedreservationDate] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 5;
    const [totalCount, setTotalCount] = useState(0);
    const [myreservations, setMyReservations] = useState([]);
    const [myReservationDetails, setMyReservationDetails] = useState([]);
    const [columnDefs] = useState([
      { titlename: "예약ID", field: "reservation_code", width: 90, align: "center" },
      { titlename: "예약일", field: "reservation_date", width: 120, align: "center" },
      { titlename: "대여일", field: "rental_date", width: 120, align: "center" },
      { titlename: "대여지점", field: "rental_location_name", width: 110, align: "center" },
      { titlename: "반납일", field: "return_date", width: 120, align: "center" },
      { titlename: "반납지점", field: "return_location_name", width: 110, align: "center" },
      { titlename: "차종", field: "car_type_name", width: 150, align: "center" },
      { titlename: "예약상태", field: "reservation_status", width: 120, align: "center" },
      { titlename: "내역보기", field: "", width: 110, align: "center" },
    ]);
    // 랜더링
    useEffect(() => {
      if (!isLoginState) {
        alert("로그인이 필요합니다.");
        navigate("/login", { state: { from: "/mypage" } });
        return;
      }
      pagingMyReservations();
      getTotalCount();
    }, [pageNumber,myReservationDetails]);

    useEffect(() => {
      if (!isLoginState) {
        return;
      }
      handleFetchBranchNames();
    }, []);

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
      return `${number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원`;
    };
    const pagingMyReservations = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        await getMyReservations(token);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          try {
            const newToken = await refreshAccessToken();
            await getMyReservations(newToken);
          } catch (error) {
            alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
            handleLogout();
          }
        } else {
          console.error('There was an error fetching the reservations pageing!', error);
        }
      }
    };

    const getMyReservations = async (token) => {
      const params = {
        pageSize,
        pageNumber,
        userCode,
      };

      if (selectedBranch && selectedBranch.trim() !== '') {
        params.rentalLocationName = selectedBranch;
      }
      if (selectedReservationDate) {
        params.reservationDate = formatDateToCompact(selectedReservationDate);
      }

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/myreservations`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true,
        });

      if (response.data && response.data.length > 0) {
        setMyReservations(response.data); // 데이터가 있는 경우
      } else {
        setMyReservations([]); // 데이터가 없는 경우 빈 배열로 설정
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
            handleLogout();
          }
        } else {
          console.error('There was an error fetching the Reservations count!', error);
        }
      }
    };

    const getCount = async (token) => {
      const params = {
        userCode,
        ...((selectedBranch && { rentalLocationName: selectedBranch }) || {}),
        ...((selectedReservationDate && { reservationDate: formatDateToCompact(selectedReservationDate) }) || {}),
      };

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/myreservations/count`,
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

    const handlePageChange = (newPageNumber) => {
      setPageNumber(newPageNumber);
    };

    // 검색 조건 변경 후 초기화 코드
    const handleSearchClick = async () => {
      setPageNumber(1);
      await pagingMyReservations();
      await getTotalCount();
    };

    let totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;

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

    const handleFetchMyReservationDetail = async (reservationCode, userCode) => {
      if (!reservationCode || !userCode) {
        return; // 값이 없으면 중단
      }
      try {
        const token = localStorage.getItem("accessToken");
        await getMyReservationDetails(token, reservationCode, userCode);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          try {
            const newToken = await refreshAccessToken();
            await getMyReservationDetails(newToken, reservationCode, userCode);
          } catch (error) {
            alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
            handleLogout();
          }
        } else {
          console.error("There was an error fetching the reservation details!", error);
        }
      }
    };
    const getMyReservationDetails = async (token, reservationCode, userCode) => {

      if (!reservationCode || !userCode) {
        return;
      }

      const params = {
        reservationCode,
        userCode,
      };

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/arentcar/manager/myreservations/detail`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data) {
        setMyReservationDetails(response.data);
      }
    };

    const handleButtonNavigation = (path) => {
      navigate(path);
    };

    const handleDetailClick = (reservationCode, userCode) => {
      setIsPopUp(true);
      handleFetchMyReservationDetail(reservationCode, userCode);
    };

    const handlePopupCloseClick = () => {
      setIsPopUp(false);
      setMyReservationDetails([]);
    };

    const handleInfoDetailClick = () => {
      setIsDetailPopup(true);
    }

    const handleInfoDetailCloseClick = () => {
      setIsDetailPopup(false);
    }

    const handleMyReservationCancel = async (reservationCode, userCode) => {
      // 예약 취소 여부 확인
      const MyreservationCancelConfirmed = window.confirm("정말로 예약을 취소하시겠습니까?");
      if (!MyreservationCancelConfirmed) {
        alert("예약이 정상적으로 유지되었습니다.");
        return;
      }

      try {
        if (
          myReservationDetails.reservation_code === reservationCode &&
          myReservationDetails.reservation_status === "이용완료"
        ) {
          alert("이 예약은 이미 렌트카 이용이 완료된 상태입니다.");
          return;
        }
    
        if (
          myReservationDetails.reservation_code === reservationCode &&
          myReservationDetails.reservation_status === "예약취소"
        ) {
          alert("이 예약은 이미 취소된 상태입니다.");
          return;
        }
        const token = localStorage.getItem("accessToken");
        const params = {
          reservationCode,
          userCode,
          reservationStatus: "2", // 예약 상태: '취소'
          paymentStatus: "2",     // 결제 상태: '취소' 
          carStatus: "01",        // 렌탈카 상태 : '렌탈가능'
        };
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/arentcar/manager/myreservations/cancel`,
          null,
          {
            params,
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        alert("예약이 취소되었습니다.");
        await handleFetchMyReservationDetail(reservationCode, userCode);
      } catch (error) {
        console.error("Error in handleMyReservationCancel:", error);

        if (error.response && error.response.status === 403) {
          try {
            const newToken = await refreshAccessToken();

            localStorage.setItem("accessToken", newToken);

            await handleMyReservationCancel(reservationCode, userCode);
          } catch (error) {
            alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
            handleLogout();
          }
        } else {
          alert("예약 취소에 실패했습니다.");
        }
      }
    };

    return (
      <div className="my-page-wrap">
        <div className="my-page-content-wrap">
          <div className="my-page-content-header-wrap">
            <h2 className="my-page-content-header-title">마이페이지</h2>
          </div>
          <div className="my-page-content-body-wrap">
            <div className="my-page-body-profile-wrap">
              <div className="my-page-profile-info-wrap">
                <div className="my-page-profile-info-text">
                  <p className='my-page-profile-info-text-title'><strong>{isUserName}님</strong> 반갑습니다.</p>
                  <p className='my-page-profile-info-text-sub'>항상 A렌트카와 함께해 주셔서 감사합니다.</p>
                </div>
                <button
                  className="my-page-profile-info-button mypage-button"
                  onClick={handleInfoDetailClick}
                >
                  내 정보 관리
                </button>
                {isDetailPopup &&
                  <div className='manager-popup'>
                    <MyPageDetail onClick={handleInfoDetailCloseClick}/>
                  </div>
                }
              </div>
            </div>
            <div className="my-page-body-reservation-wrap">
              <div className="my-page-reservation-header-wrap">
                <p className="my-page-reservation-title">나의 예약현황</p>
                <button className="my-page-reservationpage-button mypage-button" onClick={() => handleButtonNavigation("/reservation")}>렌트카 예약하기</button>
              </div>
              <div className="my-page-reservation-list-wrap">
                <div className="my-page-reservation-data-list">
                  <div className='my-page-reservation-data-list-search-wrap'>
                    <input type="date"
                      placeholder="예약일"
                      value={selectedReservationDate}
                      onChange={(e) => setSelcetedreservationDate(e.target.value)}
                    />
                    <select
                      className="my-page-reservation-select"
                      value={selectedBranch} // 선택된 값
                      onChange={(e) => setSelectedBranch(e.target.value)} // 선택값 변경
                    >
                      <option value="">지점</option>
                      {branchNames.map((branch, index) => (
                        <option key={index} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleSearchClick}>
                      검색
                    </button>
                  </div>
                  <div className="my-page-reservation-data-column">
                    <ul className='my-page-reservation-data-column-title-ul'>
                      {columnDefs.map((title, index) => (
                        <li
                          key={index}
                          className="my-page-reservation-data-column-title-li"
                          style={{
                            width: `${title.width}px`,
                            textAlign: title.align,
                          }}
                        >
                          {title.titlename}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* 테이블 데이터 */}
                  <div className='my-page-reservation-data-column-wrap'>
                    <div className="my-page-reservation-data-column">
                      {myreservations.length > 0 ? (
                        myreservations.map((myreservations, index) => (
                          <ul key={index}
                            className="my-page-reservation-data-column-data-ul">
                            {columnDefs.map((column, colIndex) => (
                              <li
                                key={colIndex}
                                className="my-page-reservation-data-column-data-li"
                                style={{
                                  width: `${column.width}px`,
                                  textAlign: column.align || "center",
                                }}
                              >
                                {column.field === "" ? (
                                  <button
                                    className="my-page-reservation-data-button-detail"
                                    onClick={() => handleDetailClick(myreservations.reservation_code, userCode)}
                                  >
                                    상세보기
                                  </button>
                                ) : (
                                  column.field === "rental_date" ? (
                                    formatDate(myreservations[column.field])
                                  ) : column.field === "return_date" ? (
                                    formatDate(myreservations[column.field])
                                  ) : column.field === "reservation_date" ? (
                                    formatDate(myreservations[column.field])
                                  ) : column.field === "payment_date" ? (
                                    formatDate(myreservations[column.field])
                                  ) :
                                    myreservations[column.field]
                                )}
                              </li>
                            ))}
                          </ul>
                        ))
                      ) : (
                        <div className="my-page-reservation-no-data">
                          조건에 맞는 예약내역이 없습니다.
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="my-page-reservation-bottom-pagination-wrap ">
                    <button
                      className="my-page-reservation-pagination-button"
                      style={{ color: pageNumber === 1 ? "#aaa" : "rgb(38, 49, 155)", width: "15px", }}
                      onClick={() => handlePageChange(pageNumber - 1)}
                      disabled={pageNumber === 1}
                    >
                      &lt;
                    </button>
                    <div className="manager-reservation-pagination-info">
                      {pageNumber} / {totalPages}
                    </div>
                    <button
                      className="my-page-reservation-pagination-button"
                      style={{ color: pageNumber === totalPages ? "#aaa" : "rgb(38, 49, 155)", width: "15px", }}
                      onClick={() => handlePageChange(pageNumber + 1)}
                      disabled={pageNumber === totalPages}
                    >
                      &gt;
                    </button>
                  </div>
                  {/* 상세 팝업 */}
                  {isPopUp && (
                    <div className="manager-popup">
                      <div className="my-page-reservation-content-popup-wrap">
                        <div className="my-page-reservation-content-popup-header-wrap">
                          <div className="my-page-popup-title">예약 상세내역</div>
                          <button
                            className="my-page-button my-page-button-close"
                            onClick={handlePopupCloseClick}
                          >
                            닫기
                          </button>
                        </div>

                        {/* 예약 코드 */}
                        <div className="my-page-reservation-popup-high-reservation-id">
                          <label>예약ID : </label>
                          <span>{' '}{myReservationDetails?.reservation_code}</span>
                        </div>

                        {/* 예약 정보 */}
                        <div className="my-page-reservation-popup-section">
                          <div className="my-page-reservation-popup-section-title">예약정보</div>
                          <div className="my-page-reservation-popup-field-row">
                            <label>예약ID : </label>
                            <span>{myReservationDetails?.reservation_code}</span>
                            <label>예약일 : </label>
                            <span>{formatDate(myReservationDetails?.reservation_date)}</span>
                          </div>
                          <div className="my-page-reservation-popup-field-row">
                            <label>예약자 : </label>
                            <span>{myReservationDetails?.user_name}</span>
                            <label>연락처 : </label>
                            <span>{formatPhone(myReservationDetails?.user_phone_number)}</span>
                          </div>
                          <div className="my-page-reservation-popup-field-row">
                            <label>예약상태 : </label>
                            <span>{myReservationDetails?.reservation_status}</span>
                          </div>
                        </div>

                        {/* 차량 정보 */}
                        <div className="my-page-reservation-popup-section">
                          <div className="my-page-reservation-popup-section-title">차량정보</div>
                          <div className="my-page-reservation-popup-field-row">
                            <label>차량명 : </label>
                            <span>{myReservationDetails?.car_type_name}</span>
                            <label>연식 : </label>
                            <span>{myReservationDetails?.model_year}년식</span>
                          </div>
                          <div className="my-page-reservation-popup-field-row">
                            <label>인승 : </label>
                            <span>{myReservationDetails?.seating_capacity}</span>
                            <label>연료 : </label>
                            <span>{myReservationDetails?.fuel_type}</span>
                          </div>
                          <div className="my-page-reservation-popup-field-row">
                            <label>보험 : </label>
                            <span>{myReservationDetails?.insurance_type}</span>
                          </div>
                          <div className="my-page-reservation-popup-field-row">
                            <label>특이사항 - </label>
                            <span>
                              {`면허제한 : ${myReservationDetails?.license_restriction || "없음"}, 속도제한 : ${myReservationDetails?.speed_limit || "없음"}`}
                            </span>
                          </div>
                        </div>

                        <div className="my-page-reservation-popup-section">
                          <div className="my-page-reservation-popup-section-title">이용지점</div>
                          <div className="my-page-reservation-popup-field-row">
                            <label>대여일 : </label>
                            <span>{formatDate(myReservationDetails?.rental_date)} {formatTime(myReservationDetails?.rental_time) || ""}</span>
                            <label>대여지점 : </label>
                            <span>{myReservationDetails?.rental_branch_name}</span>
                          </div>
                          <div className="my-page-reservation-popup-field-row">
                            <label>주소 : </label>
                            <span>{myReservationDetails?.rental_branch_address}</span>
                            <label>연락처 : </label>
                            <span>{myReservationDetails?.rental_branch_phone_number}</span>
                          </div>
                          <div className="my-page-reservation-popup-field-row">
                            <label>반납일 : </label>
                            <span>{formatDate(myReservationDetails?.return_date)} {formatTime(myReservationDetails?.return_time) || ""}</span>
                            <label>반납지점 : </label>
                            <span>{myReservationDetails?.return_branch_name}</span>
                          </div>
                          <div className="my-page-reservation-popup-field-row">
                            <label>주소 : </label>
                            <span>{myReservationDetails?.return_branch_address}</span>
                            <label>연락처 : </label>
                            <span>{myReservationDetails?.return_branch_phone_number}</span>
                          </div>
                        </div>

                        {/* 결제 정보 */}
                        <div className="my-page-reservation-popup-section">
                          <div className="my-page-reservation-popup-section-title">결제정보</div>
                          <div className="my-page-reservation-popup-field-row">
                            <label>결제일 : </label>
                            <span>{formatDate(myReservationDetails?.payment_date)}</span>
                            <label>결제상태 : </label>
                            <span>{myReservationDetails?.payment_status}</span>
                          </div>
                          <div className="my-page-reservation-popup-field-row">
                            <label>결제금액 : </label>
                            <span>{formatNumberWithCommas(myReservationDetails?.payment_amount)}</span>
                          </div>
                          <div className="my-page-reservation-popup-field-row">
                            <label>결제방식 : </label>
                            <span>
                              {myReservationDetails?.payment_category || "정보 없음"} / {myReservationDetails?.payment_type || "정보 없음"}
                            </span>
                          </div>
                        </div>

                        {/* 액션 버튼 */}
                        <div className="my-page-reservation-content-popup-footer-wrap">
                          <button
                            className="my-page-reservation-content-popup-footer-cancel"
                            onClick={() => handleMyReservationCancel(myReservationDetails.reservation_code, userCode)}
                          >
                            예약취소
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default MyPage;