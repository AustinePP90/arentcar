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


	useEffect(() => {
		if (userCode) {
			getUser();
		}
	}, [userCode]);

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
	const getUser = async () => {

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
				setUserPassword(userData.user_password);
				setUserEmail(userData.user_email);
				setUserBirthDate(userData.user_birth_date);
				setUserPhoneNumber(userData.user_phone_number);
				setDriverLicenseNumber(userData.driver_license_number);
				setLicenseIssueDate(userData.license_issue_date);
				setLicenseExpiryDate(userData.license_expiry_date);
				setUserCategory(userData.user_category);
				setUsageStatus(userData.usage_status);

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
	};

	const handleDataSaveClick = async () => {
		if (!validateInputs()) {
			return;
		}

		let updateUser = {
			user_code: userCode,
			user_id: userId,
			user_password: userPassword,
			user_name: userName,
			user_email: userEmail,
			user_phone_number: userPhoneNumber,
			user_birth_date: userBirthDate,
			driver_license_number: driverLicenseNumber,
			license_issue_date: licenseIssueDate,
			license_expiry_date: licenseExpiryDate,
			user_category: userCategory,
			usage_status: usageStatus,
		};

		if (updateMode === "수정") {
			try {
				setLoading(true);
				const token = localStorage.getItem('accessToken');
				await updateUserData(token, updateUser);
				console.log(updateUser);
				console.log(updateUserData);
			} catch (error) {
				if (error.response && error.response.status === 403) {
					try {
						const newToken = await refreshAccessToken();
						await updateUserData(newToken, updateUser);
					} catch (error) {
						alert("인증이 만료되었습니다. 다시 로그인 해주세요." + error);
						handleLogout();
					}
				} else {
					alert("수정 중 오류가 발생했습니다." + error);
				}
			} finally {
				setLoading(false);
			}
		}

		setIsPopUp(false);
	};

	// 사용자 정보 업데이트
	const updateUserData = async (token, updateUser) => {
		try {
			console.log(userCode);
			const response = await axios.put(
				`${process.env.REACT_APP_API_URL}/arentcar/manager/mypagedetail/${userCode}`,
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
					setUser(response.data);
					setIsPopUp(false);
				}
				alert("자료가 수정되었습니다.");
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
							<div className="mypage-detail-update-info-data width200">
								{userName}
							</div>
						</div>
						<div className='mypage-detail-update-basic-info-email-section'>
							<div className="mypage-detail-update-info-name width200 word-right">
								<p>이메일</p>
							</div>
							<div className="mypage-detail-update-info-data width200">
								{userEmail}
							</div>
						</div>
						<div className='mypage-detail-update-basic-info-bitrhday-section'>
							<div className="mypage-detail-update-info-name width200 word-right">
								<p>생년월일</p>
							</div>
							<div className='mypage-detail-update-info-data width200' >
								{formatDate(userBirthDate)}
							</div>
						</div>
						<div className='mypage-detail-update-basic-info-cellphone-section'>
							<div className="mypage-detail-update-info-name width200 word-right">
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
									<div className='mypage-detail-update-info-name width200 word-right'>
										<p>운전면허 번호</p>
									</div>
									<div className='mypage-detail-update-info-data width200'>
										{driverLicenseNumber}
									</div>
								</div>
								<div className="mypage-detail-update-sub-info-created-date-section">
									<div className='mypage-detail-update-info-name width200 word-right'>
										<p>운전면허 발급일</p>
									</div>
									<div className='mypage-detail-update-info-data width200'>
										{formatDate(licenseIssueDate)}
									</div>
								</div>
								<div className="mypage-detail-update-sub-info-updated-date-section">
									<div className='mypage-detail-update-info-name width200 word-right'>
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
								onClick={() => handleUpdateClick("수정")}>수정</button>
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
								disabled />
						</div>
						<div className='mypage-detail-popup-line'>
							<label className='width200 word-right' htmlFor="">생년월일</label>
							<input
								className='width200 word-left'
								name="user_birth_date"
								value={userBirthDate || ""}
								type="text"
								maxLength={8}
								onChange={(e) => setUserBirthDate(e.target.value)} />
						</div>
						<div className='mypage-detail-popup-line'>
							<label className='width200 word-right' htmlFor="">휴대폰 번호</label>
							<input
								className='width200 word-left'
								name="user_phone_number"
								value={userPhoneNumber || ""}
								type="text"
								maxLength={11}
								onChange={(e) => setUserPhoneNumber(e.target.value)} />
						</div>
						<div className='mypage-detail-popup-line'>
							<label className='width200 word-right' htmlFor="">운전면허 번호</label>
							<input
								className='width200 word-left'
								name="driver_license_number"
								value={driverLicenseNumber || ""}
								type="text"
								maxLength={11}
								onChange={(e) => setDriverLicenseNumber(e.target.value)} />
						</div>
						<div className='mypage-detail-popup-line'>
							<label className='width200 word-right' htmlFor="">운전면허 발급일</label>
							<input
								className='width200 word-left'
								name="license_issue_date"
								value={licenseIssueDate || ""}
								type="text"
								maxLength={11}
								onChange={(e) => setLicenseIssueDate(e.target.value)} />
						</div>
						<div className='mypage-detail-popup-line'>
							<label className='width200 word-right' htmlFor="">운전면허 갱신일</label>
							<input
								className='width200 word-left'
								name="license_expiry_date"
								value={licenseExpiryDate || ""}
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
