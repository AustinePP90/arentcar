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

	// YYYY-MM-DD → YYYYMMDD 변환 함수()
  const formatDateToCompact = (date) => {
    if (!date) {
      return ""; // 날짜가 없으면 빈 문자열 반환
    }
    return date.replace(/-/g, ""); // "-"를 제거하여 반환
  };


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

	const handleDataSaveClick = async () => {
		if (!user) {
			console.error("User data not loaded yet");
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

			if (validateInputs()) {

				try {
					const token = localStorage.getItem('accessToken');
					await updateUserData(token, updateUser);
					setIsPopUp(false);

				} catch (error) {
					if (error.response && error.response.status === 403) {
						try {
							const newToken = await refreshAccessToken();
							await getUser(newToken, updateUser);

						} catch (error) {
							alert("인증이 만료되었습니다. 다시 로그인 해주세요." + error);
							handleLogout();
						}
        } else {
          alert("수정 중 오류가 발생했습니다." + error);
        }
      }
    }
  };

	// 사용자 정보 업데이트
	const updateUserData = async (token, updateUser) => {
	
		try {
			let token = localStorage.getItem('accessToken');
			if (!token) {
				token = await refreshAccessToken();
				if (!token) {
					console.error("Failed to refresh access token");
					return;
				}
			}

			console.log("업데이트 요청 토큰 : ", token);
			console.log("업데이트할 데이터 :", user );

			const response = await axios.put(
				`${process.env.REACT_APP_API_URL}/arentcar/manager/mypagedetail/${userCode}`,
				updateUser, // updateUser 객체 전달
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
					withCredentials:true,
				}
			);

			if (response.status === 200 || response.status === 204) {
				alert('테이터가 성공적으로 업데이트 되었습니다');
				getUser();
			} else {
				console.error('업데이트에 실패했습니다', response);
				alert("업데이트에 실패했습니다. " + response.data.message);
			}
		} catch (error) {
			console.error('데이터 업데이트 중 에러가 발생했습니다', error);
			alert("데이터 업데이트 중 에러가 발생했습니다. " + error.message);
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
			if (!/^\d{4}-\d{2}-\d{2}$/.test(user_birth_date)) {
				alert("생년월일은 YYYY-MM-DD 형식으로 입력해주세요.");
				return false;
			}

			const cleanedPhoneNumber = user_phone_number.replace(/WD/g, '');

			if (!/^\d{10,11}$/.test(cleanedPhoneNumber)) {
        alert("휴대폰 번호는 10~11자리 숫자로 입력해주세요.");
        return false;
			}
				return true;
		};

	const handleUpdateClick = () => {
		setIsPopUp(true);
		if (user) {
			setUserName(user.user_name);
			setUserEmail(user.user_email);
			setUserPhoneNumber(user.user_phone_number);
			setUserBirthDate(user.user_birth_date);
			setDriverLicenseNumber(user.driver_license_number);
			setLicenseIssueDate(user.license_issue_date);
			setLicenseExpiryDate(user.license_expiry_date);
		}
	};

	const viewDataInit = () => {
		setUserName("");
		setUserEmail("");
		setUserPhoneNumber("");
		setUserBirthDate("");
		setDriverLicenseNumber("");
		setLicenseIssueDate("");
		setLicenseExpiryDate("")
	};

	const handleInsertClick = (updateMode) => {
		setIsPopUp(true);
		setUpdateMode(updateMode);
		viewDataInit();
	};

	const handleCloseClick = () => {
    if (onClick) {
      onClick();
    }
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
								{formatDateToCompact(userPhoneNumber)}
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
										{formatDateToCompact(driverLicenseNumber)}
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
							className='mypage-detail-button'>
								회원탈퇴 버튼</button>
						</div>
				</div>
				</div>
			</div>

			 {/* 팝업 */}
			 {isPopUp &&
          <div className='mypage-detail-popup-wrap'>
            <div className='mypage-detail-content-popup-wrap'>
              <div className='mypage-detail-content-popup-close'>
                <div className='mypage-detail-content-popup-title'>
									회원 정보 수정{updateMode}
								</div>
                <div className='mypage-detail-content-popup-close-button'>
                  <button 
									className='mypage-detail-popup-close-button' 
									onClick={handleCloseClick}>닫기</button>
                </div>
              </div>
              <div className='mypage-detail-popup-line'>
                <label className='width80 word-right' htmlFor="">회원명</label>
                <input className='width300' type="text" value={userName} maxLength={50} onChange={(e) => setUserName(e.target.value)} />
              </div>
              <div className='mypage-detail-popup-line'>
                <label className='width80 word-right' htmlFor="">이메일</label>
                <input className='width300' type="text" value={userEmail} maxLength={50} onChange={(e) => setUserEmail(e.target.value)} />
              </div>
              <div className='mypage-detail-popup-line'>
                <label className='width80 word-right' htmlFor="">생년월일</label>
                <input className='width300 word-left' value={userBirthDate} type="text" maxLength={8} onChange={(e) => setUserBirthDate(e.target.value)} />
              </div>
              <div className='mypage-detail-popup-line'>
                <label className='width80 word-right' htmlFor="">휴대폰번호</label>
                <input className='width300 word-left' value={userPhoneNumber} type="text" maxLength={11} onChange={(e) => setUserPhoneNumber(e.target.value)} />
              </div>
              <div className='mypage-detail-popup-line'>
                <label className='width80 word-right' htmlFor="">운존면허번호</label>
                <input className='width300 word-left' value={driverLicenseNumber} type="text" maxLength={11} onChange={(e) => setDriverLicenseNumber(e.target.value)} />
              </div>
              <div className='mypage-detail-popup-line'>
                <label className='width80 word-right' htmlFor="">운전면허 발급일</label>
                <input className='width300 word-left' value={licenseIssueDate} type="text" maxLength={11} onChange={(e) => setLicenseIssueDate(e.target.value)} />
              </div>
              <div className='mypage-detail-popup-line'>
                <label className='width80 word-right' htmlFor="">운전면허 갱신일</label>
                <input className='width300 word-left' value={licenseExpiryDate} type="text" maxLength={11} onChange={(e) => setLicenseExpiryDate(e.target.value)} />
              </div>
            </div>
						<div className='mypage-detail-popup-save-wrap'>
							<div></div>
							<div className='mypage-detail-popup-save'>
								<button className='mypage-detail-popup-save-button' onClick={handleDataSaveClick}>저장</button>
							</div>
						</div>
          </div>
        }
		</div>
	);
};

export default MyPageDetail;
