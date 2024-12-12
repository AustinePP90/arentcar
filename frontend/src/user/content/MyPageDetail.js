import React, { useEffect, useState } from 'react';
import { formatPhone, refreshAccessToken, formatDate, handleLogout } from "common/Common";
import axios from 'axios';
import 'user/content/MyPageDetail.css'
import { useSelector } from 'react-redux';

const MyPageDetail = ({onClick}) => {

	const userCode = useSelector((state) => state.userState.userCode);
	const [isPopUp, setIsPopUp] = useState(false);
	const [updateMode,setUpdateMode] = useState("");
	const [user, setUser] = useState("");
	const [userName, setUserName] = useState("");
	const [userEmail, setUserEmail] = useState("");
	const [userBirthDate, setUserBirthDate] = useState("");
	const [userPhoneNumber, setUserPhoneNumber] = useState("");
	const [driverLicenseNumber, setDriverLicenseNumber] = useState("");
	const [licenseIssueDate, setLicenseIssueDate] = useState("");
	const [licenseExpiryDate, setLicenseExpiryDate] = useState("");

	useEffect(() => {
		if (userCode){
			getUser();
		}
	}, [userCode]);

	// 사용자 정보 불러오기
	const getUser= async () => {	

		try {
			let token = localStorage.getItem('token');

			if (!token) {
				token = await refreshAccessToken();
				if (!token) {
					console.error("Failed to refresh acccess token");
					return;
				}
			}

			const response = await axios.get(
				`${process.env.REACT_APP_API_URL}/arentcar/manager/mypagedetail/${userCode}`,
        {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
        withCredentials: true,
      }
		);

		if (response.status === 200 && response.data) {
			const userData = response.data;
      setUser(userData);
      setUserName(userData.user_name);
      setUserEmail(userData.user_email);
      setUserBirthDate(userData.user_birth_date);
      setUserPhoneNumber(userData.user_phone_number);
      setDriverLicenseNumber(userData.driver_license_number);
      setLicenseIssueDate(userData.license_issue_date);
      setLicenseExpiryDate(userData.license_expiry_date); // 모든 state 업데이트

			console.log("userData상태 : ", userData);
		} else {
			console.error("API Error :", response.status, response.data);
		}

		} catch (error) {
			console.error('데이터를 불러오지 못했습니다', error);
		}
	};

	const handleUpdateClick = () => {
		if (!user) {  // user 데이터가 있는지 확인
      alert("사용자 정보를 불러오는 중입니다.");
      return;
    }
    setIsPopUp(true);
    setUpdateMode("수정"); // 수정 모드 설정
    // user 데이터에서 값 설정 (setState는 비동기적이므로 직접 user 객체에서 가져옴)
    setUserName(user.user_name);
    setUserEmail(user.user_email);
    setUserPhoneNumber(user.user_phone_number);
    setUserBirthDate(user.user_birth_date);
    setDriverLicenseNumber(user.driver_license_number);
    setLicenseIssueDate(user.license_issue_date);
    setLicenseExpiryDate(user.license_expiry_date);
	};

	const handleDataSaveClick = async () => {
		if (!validateInputs()) {
			return;
		}

    let updateUser = {
      user_name: userName,
      user_email: userEmail,
      user_phone_number: userPhoneNumber,
      user_birth_date: userBirthDate,
			driver_license_number: driverLicenseNumber,
			license_issue_date: licenseIssueDate,
			license_expiry_date: licenseExpiryDate,
			};

			if (updateMode === "수정") {
				try {
					const token = localStorage.getItem('accessToken');
					// 토큰 만료 시 갱신 로직 추가
					if (!token) {
						const newToken = await refreshAccessToken();
						if (!newToken) {
							alert("토큰 갱신에 실패했습니다. 다시 로그인해주세요.");
							handleLogout();
							return;
						}
						 // updateUserData 함수에 newToken 전달
						await updateUserData(newToken, updateUser); 
					} else {
						// 기존 토큰이 유효한 경우
						await updateUserData(token, updateUser);
					}
	
					setIsPopUp(false);
				} catch (error) {
						alert("수정 중 오류가 발생했습니다." + error);
						console.error("Update Error:", error); // 에러 로그 출력
					}
			}
  };

		// 사용자 정보 업데이트
		const updateUserData = async (token, updateUser) => {
			try {
				const response = await axios.put(
					`${process.env.REACT_APP_API_URL}/arentcar/manager/mypagedetail/${userCode}`, // API 엔드포인트 수정
					updateUser,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
						withCredentials: true,
					}
				);
	
				if (response.status === 200 || response.status === 204) {
					// 업데이트 성공 시 사용자 정보 다시 불러오기
					getUser();  // 또는 setUser(updateUser)
					alert("자료가 수정되었습니다.");
				} else {
					console.error("업데이트 실패:", response.status, response.data);
					alert("업데이트에 실패했습니다. " + response.data.message);
				}
			} catch (error) {
				console.error("업데이트 중 에러 발생:", error);
				alert("업데이트 중 에러가 발생했습니다." + error.message);
			}
		};

		const handleDeleteClick = async () => {
			if (!window.confirm("정말로 탈퇴하시겠습니까?")) {
				return; // 취소 버튼 클릭 시 함수 종료
			}
		
			try {
				let token = localStorage.getItem('token');
				if (!token) {
					token = await refreshAccessToken();
					if (!token) {
						console.error("Failed to refresh access token");
						handleLogout();
						return;
					}
				}
		
				const response = await axios.delete(
					`${process.env.REACT_APP_API_URL}/arentcar/user/users/${userCode}`, // API 엔드포인트
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
						withCredentials: true,
					}
				);
		
				if (response.status === 204) { // 204 No Content 확인
					alert("탈퇴 처리가 완료되었습니다.");
					handleLogout(); // 로그아웃 처리 (필요에 따라 다른 페이지로 이동)
				} else {
					console.error("탈퇴 실패:", response.status, response.data);
					alert("탈퇴 처리에 실패했습니다.");
				}
			} catch (error) {
				console.error("탈퇴 중 에러 발생:", error);
				alert("탈퇴 처리 중 오류가 발생했습니다.");
			}
		};

	  // 입력 유효성 검사
		const validateInputs = () => {
			if (!user) {
				alert("사용자 정보를 불러오는 중입니다.");
        return false;
			}

			const { user_birth_date, user_phone_number } = user;

			if (!user_birth_date || !user_phone_number) {
				alert("모든 필드를 올바르게 입력해주세요.");
				return false;
			}

			const cleanedPhoneNumber = user_phone_number.replace(/WD/g, '');

			if (!/^\d{10,11}$/.test(cleanedPhoneNumber)) {
        alert("휴대폰 번호는 10~11자리 숫자로 입력해주세요.");
        return false;
			}
				return true;
		};

	const handleCloseClick = () => {
    if (onClick) {
      onClick();
    } 
  };

	const handlePopupCloseClick = () => {
		setIsPopUp(false);
	};


	return (
		<div className="mypage-detail-update-wrap">
			<div className='mypage-detail-update-contents-wrap'>
				<div className="mypage-detail-update-contents">
					<div className="mypage-detail-update-title">
						<div className='mypage-detail-update-title-name'>
						 	<p>기본 정보 확인</p>
						</div>
						<div className="mypage-detail-update-close">
							<button 
							className='mypage-detail-button'
							onClick={handleCloseClick}>닫기</button>
						</div>
					</div>
					<div className="mypage-detail-update-basic-info-wrap">
						<div className='mypage-detail-update-basic-info-name-section'>
							<div className="mypage-detail-update-info-name width200">
								<p>이름</p>
							</div>
							<div className="mypage-detail-update-info-data width200">
								{userName}
							</div>
						</div>
						<div className='mypage-detail-update-basic-info-email-section'>
							<div className="mypage-detail-update-info-name width200">
								<p>이메일</p>
							</div>
							<div className="mypage-detail-update-info-data width200">
								{userEmail}
							</div>
						</div>
						<div className='mypage-detail-update-basic-info-bitrhday-section'>
							<div className="mypage-detail-update-info-name width200">
								<p>생년월일</p>
							</div>
							<div className='mypage-detail-update-info-data width200' >
								{formatDate(userBirthDate)}
							</div>
						</div>
						<div className='mypage-detail-update-basic-info-cellphone-section'>
							<div className="mypage-detail-update-info-name width200">
								<p>휴대폰번호</p>
							</div>
							<div className='mypage-detail-update-info-data width200'>
								{formatPhone(userPhoneNumber)}
							</div>
						</div>
					</div>
					<div className="mypage-detail-update-sub-info-addinfo">
						<div className="mypage-detail-update-sub-info-title">
							<p>추가 정보 확인</p>
						</div>
						<div className="mypage-detail-update-sub-info-box">
							<div className="mypage-detail-update-sub-info-section">
								<div className='mypage-detail-update-sub-info-license-number-section'>
									<div className='mypage-detail-update-info-name width200'>
										<p>운전면허 번호</p>
									</div>
									<div className='mypage-detail-update-info-data width200'>
										{driverLicenseNumber}
									</div>
								</div>
								<div className="mypage-detail-update-sub-info-created-date-section">
									<div className='mypage-detail-update-info-name width200'>
										<p>운전면허 발급일</p>
									</div>
									<div className='mypage-detail-update-info-data width200'>
										{formatDate(licenseIssueDate)}
									</div>
								</div>
								<div className="mypage-detail-update-sub-info-updated-date-section">
									<div className='mypage-detail-update-info-name width200'>
										<p>운전면허 갱신일</p>
									</div>
									<div className='mypage-detail-update-info-data width200'>
										{formatDate(licenseExpiryDate)}
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className='mypage-detail-update-sub-info-save-box'>
						<div></div>
						<div className='mypage-detail-update-sub-info-save'>
							<button 
							className='mypage-detail-button'
							onClick={handleUpdateClick}>수정</button>
						</div>
					</div>
				</div>
				<div className="mypage-detail-update-signout">
					<div className='mypage-detail-update-signout-label'>
						<p>회원탈퇴 확인</p>
					</div>
					<div className='mypage-detail-update-signout-box'>
						<div className="mypage-detail-update-signout-act">
							<button 
							className='mypage-detail-button'
							onClick={handleDeleteClick}>
								회원탈퇴 버튼</button>
						</div>
					</div>
				</div>
			</div>

			 {/* 팝업 */}
			 {isPopUp &&
          <div className='mypage-detail-popup-wrap manager-popup'>
            <div className='mypage-detail-content-popup-wrap'>
              <div className='mypage-detail-content-popup-close'>
                <div className='mypage-detail-content-popup-title'>
									회원 정보 {updateMode}
								</div>
                <div className='mypage-detail-content-popup-close-button'>
                  <button 
									className='mypage-detail-popup-close-button' 
									onClick={handlePopupCloseClick}>닫기</button>
                </div>
              </div>
              <div className='mypage-detail-popup-line'>
                <label className='width200 word-right' htmlFor="">회원명</label>
                <input 
									className='width200' 
									type="text" 
									value={userName} 
									disabled />
              </div>
              <div className='mypage-detail-popup-line'>
                <label className='width200 word-right' htmlFor="">이메일</label>
                <input 
									className='width200' 
									type="text" value={userEmail} 
									disabled/>
              </div>
              <div className='mypage-detail-popup-line'>
                <label className='width200 word-right' htmlFor="">생년월일</label>
                <input 
									className='width200 word-left' 
									value={userBirthDate} 
									type="text" 
									maxLength={8} 
									onChange={(e) => setUserBirthDate(e.target.value)} />
              </div>
              <div className='mypage-detail-popup-line'>
                <label className='width200 word-right' htmlFor="">휴대폰 번호</label>
                <input 
									className='width200 word-left' 
									value={userPhoneNumber} 
									type="text" 
									maxLength={11} 
									onChange={(e) => setUserPhoneNumber(e.target.value)} />
              </div>
              <div className='mypage-detail-popup-line'>
                <label className='width200 word-right' htmlFor="">운전면허 번호</label>
                <input 
									className='width200 word-left' 
									value={driverLicenseNumber} 
									type="text" 
									maxLength={11} 
									onChange={(e) => setDriverLicenseNumber(e.target.value)} />
              </div>
              <div className='mypage-detail-popup-line'>
                <label className='width200 word-right' htmlFor="">운전면허 발급일</label>
                <input 
									className='width200 word-left' 
									value={licenseIssueDate} 
									type="text" 
									maxLength={11} 
									onChange={(e) => setLicenseIssueDate(e.target.value)} />
              </div>
              <div className='mypage-detail-popup-line'>
                <label className='width200 word-right' htmlFor="">운전면허 갱신일</label>
                <input 
									className='width200 word-left' 
									value={licenseExpiryDate} 
									type="text" 
									maxLength={11} 
									onChange={(e) => setLicenseExpiryDate(e.target.value)} />
              </div>
							<div className='mypage-detail-popup-save-wrap'>
								<div className='mypage-detail-popup-save'>
									<div></div>
									<button 
										className='mypage-detail-popup-save-button'
										onClick={handleDataSaveClick}>저장</button>
								</div>
							</div>
            </div>
          </div>
        }
		</div>
	);
};

export default MyPageDetail;
