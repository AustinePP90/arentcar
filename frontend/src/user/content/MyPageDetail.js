import React, { useEffect, useState } from 'react';
import { formatPhone, refreshAccessToken, formatDate, handleLogout } from "common/Common";
import axios from 'axios';
import 'user/content/MyPageDetail.css'
import { useSelector } from 'react-redux';

const MyPageDetail = ({ onClick }) => {

	const userCode = useSelector((state) => state.userState.userCode);
	const [user, setUser] = useState([]);
	const [isPopUp, setIsPopUp] = useState(false);
	const [loading, setLoading] = useState(false);
	const [updateMode, setUpdateMode] = useState("");
	const [userId, setUserId] = useState("");
	const [userPassword, setUserPassword] = useState("");
	const [userName, setUserName] = useState("");
	const [userEmail, setUserEmail] = useState("");
	const [userBirthDate, setUserBirthDate] = useState("");
	const [userPhoneNumber, setUserPhoneNumber] = useState("");
	const [driverLicenseNumber, setDriverLicenseNumber] = useState("");
	const [licenseIssueDate, setLicenseIssueDate] = useState("");
	const [licenseExpiryDate, setLicenseExpiryDate] = useState("");
	const [userCategory, setUserCategory] = useState("");
	const [usageStatus, setUsageStatus] = useState("");
	const [editedUser, setEditedUser] = useState(null); // 팝업에서 수정된 user 정보를 저장할 state


	useEffect(() => {
    const fetchUser = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.error("Token이 없습니다. 로그인을 다시 시도해주세요.");
            handleLogout();
            return;
        }
        if (userCode) {
            try {
                await getUser(token); // getUser 호출
            } catch (error) {
                console.error("User 정보 로드 실패:", error);
            }
        } else {
            console.error("UserCode가 없습니다.");
        }
    };

    fetchUser(); // 비동기 함수 호출
}, [userCode]); // userCode가 변경될 때 실행


	useEffect(() => {
		// user 상태가 변경될 때마다 팝업 상태 변수 업데이트
		if (user) {
			setUserPhoneNumber(user.user_phone_number);
			setUserBirthDate(user.user_birth_date);
			setDriverLicenseNumber(user.driver_license_number);
			setLicenseIssueDate(user.license_issue_date);
			setLicenseExpiryDate(user.license_expiry_date);
		}
	}, [user], isPopUp); // user 상태 변경 시에만 실행

	// 사용자 정보 불러오기
	const getUser = async (token) => {
		try {
	        // 유저 정보 API 호출
        const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/arentcar/user/users/${userCode}`,
            {
          		headers: {
           		 Authorization: `Bearer ${token}`
          },
          withCredentials: true,
            }
        );

        // 성공적으로 데이터를 가져왔을 때 처리
        if (response.status === 200 && response.data) {

            const userData = response.data;
            setUser(userData); // 전체 사용자 데이터 설정
            setUserName(userData.user_name);
            setUserPassword(userData.user_password);
            setUserEmail(userData.user_email);
            setUserBirthDate(userData.user_birth_date);
            setUserPhoneNumber(userData.user_phone_number);
            setDriverLicenseNumber(userData.driver_license_number);
            setLicenseIssueDate(userData.license_issue_date);
            setLicenseExpiryDate(userData.license_expiry_date);
            setUserCategory(userData.user_category);
            setUsageStatus(userData.usage_status);
        } else {
            console.error("API Error:", response.status, response.data);
        }
			} catch (error) {
        if (error.response && error.response.status === 403) {
            console.warn("Token expired or unauthorized. Attempting to refresh token...");

            try {
                // 토큰 새로고침 로직 호출
                const newToken = await refreshAccessToken();
                if (newToken) {
                    await getUser(newToken); // 새 토큰으로 재요청
                } else {
                    alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
                    handleLogout(); // 로그아웃 처리
                }
            } catch (refreshError) {
                console.error("Failed to refresh token:", refreshError);
                alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
                handleLogout(); // 로그아웃 처리
            }
        } else {
            console.error("Failed to fetch user data:", error);
        }
    }
};


	const handleUpdateClick = () => {
		if (!user) {  // user 데이터가 있는지 확인
			alert("사용자 정보를 불러오는 중입니다.");
			return;
		}
		setIsPopUp(true);
		setUpdateMode("수정"); // 수정 모드 설정
		setEditedUser({ ...user }); // 팝업 열 때 user 데이터 복사
	};

	const handleDataSaveClick = async () => {
		if (!editedUser) return;

		for (const key in editedUser) {
			if (!validateInputs(key, editedUser[key])) {
				return;
			}
		}

		let updateUser = { ...editedUser };

		try {
			setLoading(true);

			let token = localStorage.getItem('accessToken');
			if (!token) {
					token = await refreshAccessToken(); // 토큰 갱신
					if (!token) throw new Error("토큰 갱신 실패");
			}

			await updateUserData(token, updateUser); // 데이터 업데이트
			// console.log("User updated successfully:", updateUser);

			setIsPopUp(false); // 팝업 닫기
			await getUser(token); // 최신 데이터 로드
	} catch (error) {
			console.error("Error during update:", error);

			if (error.response && error.response.status === 403) {
					alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
					handleLogout();
			} else {
					alert("수정 중 오류가 발생했습니다. 네트워크 상태를 확인하세요.");
			}
	} finally {
			setLoading(false);
	}
};

	// 사용자 정보 업데이트
	const updateUserData = async (token, updateUser) => {
		try {
			console.log(userCode);
			const response = await axios.put(
				`${process.env.REACT_APP_API_URL}/arentcar/user/users/${userCode}`,
				updateUser,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
					withCredentials: true,
				}
			);

			if (response.status === 200 || response.status === 204) {
				// 200 또는 204는 성공으로 처리
				if (response.status === 200 && response.data) {
					// 200 이고 데이터가 있으면 상태 업데이트
						alert("자료가 수정되었습니다");
						return response.data;
		
				} else {
					alert("자료가 수정되었습니다.");
					return;
				}
			} else {
				console.error("업데이트 실패:", response.status, response.data);
				alert("수정 중 오류가 발생했습니다. " + (response.data?.message || "관리자에게 문의하세요."));
			}
		} catch (error) {
			// 네트워크 오류 등 예외 처리
			console.error("업데이트 실패 : ", error);
			alert("수정중 오류가 발생했습니다. 네트워크 연결을 확인하세요");
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
	const validateInputs = (fieldName, value) => { // 수정할 필드 이름과 값을 인자로 받음
		switch (fieldName) {
			case "user_birth_date":
				// 생년월일 형식 검사 
				if (value && !/^\d{8}$/.test(value)) {
					alert("생년월일은 8자리 숫자로 입력해주세요.");
				}
				break;

			case 'user_phone_number':
				if (!value) {
					alert("휴대폰 번호를 입력해주세요.");
					return false;
				}
				const cleanedPhoneNumber = value.replace(/\D/g, '');
				if (value && !/^\d{10,11}$/.test(cleanedPhoneNumber)) {
					alert("휴대폰 번호는 10~11자리 숫자로 입력해주세요.");
					return false;
				}
				break;

			case 'driver_license_number':
				if (!value) {
					alert("운전면허 번호를 입력해주세요.");
					return false;
				}
				// 운전면허 번호 형식 검사 (필요한 경우 추가)
				break;

			case 'license_issue_date':
				if (!value) {
					alert("운전면허 발급일을 입력해주세요.");
					return false;
				}
				// 날짜 형식 검사 (필요한 경우 추가)
				break;

			case 'license_expiry_date':
				if (!value) {
					alert("운전면허 갱신일을 입력해주세요.");
					return false;
				}
				// 날짜 형식 검사 (필요한 경우 추가)
				break;

			default:
				return true;
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
		setEditedUser(null);
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
							<div className="mypage-detail-update-info-name width200 word-right">
								<p>이름</p>
							</div>
							<div className="mypage-detail-update-info-data width300">
								{userName}
							</div>
						</div>
						<div className='mypage-detail-update-basic-info-email-section'>
							<div className="mypage-detail-update-info-name width200 word-right">
								<p>이메일</p>
							</div>
							<div className="mypage-detail-update-info-data width300">
								{userEmail}
							</div>
						</div>
						<div className='mypage-detail-update-basic-info-bitrhday-section'>
							<div className="mypage-detail-update-info-name width200 word-right">
								<p>생년월일</p>
							</div>
							<div className='mypage-detail-update-info-data width300' >
								{formatDate(userBirthDate)}
							</div>
						</div>
						<div className='mypage-detail-update-basic-info-cellphone-section'>
							<div className="mypage-detail-update-info-name width200 word-right">
								<p>휴대폰번호</p>
							</div>
							<div className='mypage-detail-update-info-data width300'>
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
									<div className='mypage-detail-update-info-name width200 word-right'>
										<p>운전면허 번호</p>
									</div>
									<div className='mypage-detail-update-info-data width300'>
										{driverLicenseNumber}
									</div>
								</div>
								<div className="mypage-detail-update-sub-info-created-date-section">
									<div className='mypage-detail-update-info-name width200 word-right'>
										<p>운전면허 발급일</p>
									</div>
									<div className='mypage-detail-update-info-data width300'>
										{formatDate(licenseIssueDate)}
									</div>
								</div>
								<div className="mypage-detail-update-sub-info-updated-date-section">
									<div className='mypage-detail-update-info-name width200 word-right'>
										<p>운전면허 갱신일</p>
									</div>
									<div className='mypage-detail-update-info-data width300'>
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
								onClick={() => handleUpdateClick("수정")}>수정</button>
						</div>
					</div>
				</div>
				<div className="mypage-detail-update-signout">
					<div className='mypage-detail-update-signout-label'>
						<p>회원탈퇴 확인hkhkhkhk</p>
					</div>
					<div className='mypage-detail-update-signout-box'>
						<div className="mypage-detail-update-signout-act">
							<button
								className='mypage-detail-signout-button'
								onClick={handleDeleteClick}>
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
								회원 정보 {updateMode}
							</div>
							<div className='mypage-detail-content-popup-close-button'>
								<button
									className='mypage-detail-button'
									onClick={handlePopupCloseClick}>닫기</button>
							</div>
						</div>
						<div className='mypage-detail-popup-line'>
							<label className='width150 word-right' htmlFor="">회원명</label>
							<input
								className='width200'
								type="text"
								value={userName}
								disabled />
						</div>
						<div className='mypage-detail-popup-line'>
							<label className='width150 word-right' htmlFor="">이메일</label>
							<input
								className='width200'
								type="text" value={userEmail}
								disabled />
						</div>
						<div className='mypage-detail-popup-line'>
							<label className='width150 word-right' htmlFor="">생년월일</label>
							<input
								className='width200 word-left'
								name="user_birth_date"
								value={editedUser.user_birth_date || ""}
								type="text"
								maxLength={8}
								onChange={(e) => setEditedUser({ ...editedUser, user_birth_date : e.target.value})} />
						</div>
						<div className='mypage-detail-popup-line'>
							<label className='width150 word-right' htmlFor="">휴대폰 번호</label>
							<input
								className='width200 word-left'
								name="user_phone_number"
								value={editedUser.user_phone_number || ""}
								type="text"
								maxLength={11}
								onChange={(e) => setEditedUser({ ...editedUser, user_phone_number : e.target.value})} />
						</div>
						<div className='mypage-detail-popup-line'>
							<label className='width150 word-right' htmlFor="">운전면허 번호</label>
							<input
								className='width200 word-left'
								name="driver_license_number"
								value={editedUser.driver_license_number || ""}
								type="text"
								maxLength={11}
								onChange={(e) => setEditedUser({ ... editedUser, driver_license_number : e.target.value})} />
						</div>
						<div className='mypage-detail-popup-line'>
							<label className='width150 word-right' htmlFor="">운전면허 발급일</label>
							<input
								className='width200 word-left'
								name="license_issue_date"
								value={editedUser.license_issue_date || ""}
								type="text"
								maxLength={11}
								onChange={(e) => setEditedUser({ ... editedUser, license_issue_date : e.target.value})} />
						</div>
						<div className='mypage-detail-popup-line'>
							<label className='width150 word-right' htmlFor="">운전면허 갱신일</label>
							<input
								className='width200 word-left'
								name="license_expiry_date"
								value={editedUser.license_expiry_date || ""}
								type="text"
								maxLength={11}
								onChange={(e) => setEditedUser({ ...editedUser, license_expiry_date : e.target.value})} />
						</div>
						<div className='mypage-detail-popup-save-wrap'>
							<div className='mypage-detail-popup-save'>
								<div></div>
								<button
									className='mypage-detail-button'
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
