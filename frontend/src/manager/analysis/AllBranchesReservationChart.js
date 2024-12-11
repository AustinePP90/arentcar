// 전체 지점 예약 통계
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { refreshAccessToken, handleLogout as handleAdminLogout, formatTime, isValidTimeFormat } from 'common/Common';
import Loading from 'common/Loading';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// 차트 라이브러리의 필요한 요소를 등록
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const AllBranchesReservationChart = ({ onClick }) => {
    const [branchs, setBranchs] = useState([]); // DB에서 읽어온 지점 데이터
    const [isDetailPopUp, setIsDetailPopUp] = useState(false); // 지점 상세 팝업
    const [searchBranchName, setSearchBranchName] = useState(""); // 지점명 검색
    const [branchDetails, setBranchDetails] = useState([]); // 지점 상세 데이터
    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(1); // 페이지 번호
    const [totalCount, setTotalCount] = useState(0); // 총 검색 건수
    const [chartData, setChartData] = useState([]);
    const pageSize = 10;

    const [columnDefs] = useState([
        { headerName: '코드', field: 'branch_code', width: 70, align: 'center' },
        { headerName: '지점명', field: 'branch_name', width: 110, align: 'center' },
        { headerName: '지역이름', field: 'region_name', width: 110, align: 'center' },
        { headerName: '기본주소', field: 'branch_basic_address', width: 150, align: 'center' },
        { headerName: '전화번호', field: 'branch_phone_number', width: 150, align: 'center' },
        { headerName: '개점시간', field: 'available_pickup_time', width: 100, align: 'center' },
        { headerName: '폐점시간', field: 'available_return_time', width: 100, align: 'center' },
        { headerName: '상세보기', field: '', width: 180, align: 'center' },
    ]);

    // 지점 데이터 관리
    const [branchCode, setBranchCode] = useState("");
    const [branchName, setBranchName] = useState("");
    const [branchLongitude, setBranchLongitude] = useState("");
    const [branchLatitude, setBranchLatitude] = useState("");
    const [regionCode, setRegionCode] = useState("");
    const [regionName, setRegionName] = useState("");
    const [postCode, setPostCode] = useState("");
    const [branchBasicAddress, setBranchBasicAddress] = useState("");
    const [branchDetailedAddress, setBranchDetailedAddress] = useState("");
    const [branchPhoneNumber, setBranchPhoneNumber] = useState("");
    const [availablePickupTime, setAvailablePickupTime] = useState("");
    const [availableReturnTime, setAvailableReturnTime] = useState("");

    // 지점 데이터 가져오기
    const getBranchs = async (token) => {
        const params = {
            pageSize, // 페이지 크기
            pageNumber, // 현재 페이지 번호
        };

        // 검색 조건이 있다면
        if (searchBranchName && searchBranchName.trim() !== '') {
            // 검색어(지점명)를 params에 추가
            params.branchName = searchBranchName;
        }

        // API 요청: 지점 데이터 가져오기
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/branchs/paged`,
            {
                params, // 위에서 정의한 페이징과 검색 조건
                headers: {
                    Authorization: `Bearer ${token}` // 인증 토큰 헤더에 추가
                },
                withCredentials: true, // 쿠키 전송 활성화
            });

        // 만약 응답 데이터가 있다면 상태로 업데이트
        if (response.data) {
            // 지점 데이터를 상태로 저장
            setBranchs(response.data);
        }
    };

    // 전체 지점 수 가져오기
    const getTotalCount = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            // 총 개수를 가져오는 함수 호출, await를 이용하여 API 요청 끝날때까지 대기 후 코드 실행
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
                console.error('There was an error fetching the branchs count!', error);
            }
        }
    };

    // 총 지점 수 요청
    const getCount = async (token) => {
        // 지점명을 검색한다면(searchBranchName) params에 추가
        const params = searchBranchName ? { branchName: searchBranchName } : {};

        // API 요청: 지점 수 가져오기
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/branchs/count`,
            {
                params,
                headers: {
                    Authorization: `Bearer ${token}`
                },
                withCredentials: true,
            });

        console.log('Branch count response:', response.data);

        // 응답 데이터가 숫자라면 상태로 저장
        if (typeof response.data === 'number') {
            setTotalCount(response.data);
        } else {
            console.error('Unexpected response:', response.data);
        }
    };

    // 지점 데이터 페이징 처리
    const pageingBranchs = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            // 지점 데이터 가져오는 함수 호출 (토큰 필요)
            await getBranchs(token);
        } catch (error) {
            // 403 == 토큰 만료
            if (error.response && error.response.status === 403) {
                try {
                    const newToken = await refreshAccessToken();
                    await getBranchs(newToken);
                } catch (error) {
                    // 새 토큰 요청도 실패하면 인증 만료 알림 및 로그아웃 처리
                    alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
                    handleAdminLogout();
                }
            } else {
                console.error('There was an error fetching the branchs pageing!', error);
            }
        }
    };
    // 페이지 번호 / 크기가 바뀔 때 데이터 요청
    useEffect(() => {
        pageingBranchs(); // 지점 데이터 가져오기
        getTotalCount(); // 전체 지점 수 가져오기
    }, [pageNumber, pageSize]); // 페이지 번호, 크기가 변경될 때 실행

    // 테이블 컬럼 너비 합산 계산
    const totalWidth = columnDefs.reduce((sum, columnDef) => {
        // columnDef[]에 컬럼 너비가 명시되어 있으면 더하고, 없으면 기본 값(150)을 더함
        return sum + (columnDef.width ? columnDef.width : 150);
    }, 0);

    // 변경된 현재 페이지 번호(-1씩 또는 +1씩 가감)
    const handlePageChange = (newPageNumber) => {
        setPageNumber(newPageNumber);
    };

    // 총 페이지 수 = 올림(전체 차종 수 / 화면에 보여줄 데이터 수(현재 페이지에서는 10개씩 보여줌))
    let totalPages = Math.ceil(totalCount / pageSize);
    if (totalPages < 1) {
        totalPages = 1;
    }

    // 컴포넌트 닫기 버튼
    const handleCloseClick = () => {
        if (onClick) {
            onClick();
        }
    };

    // 지점 상세 팝업 닫기
    const handlePopupCloseClick = () => {
        setIsDetailPopUp(false);
        setBranchDetails([]);
    };

    // 검색 버튼
    const handleSearchClick = async () => {
        pageingBranchs();
        getTotalCount();
    };

    // 지점 상세 팝업창 열기
    const fetchBranchDetails = async (branchCode) => {
        console.log("[fetchBranchDetails] 시작 - branchCode:", branchCode); // 함수 시작

        try {
            const token = localStorage.getItem("accessToken");
            await getBranchDetails(token, branchCode);
        } catch (error) {
            if (error.response && error.response.status === 403) {
                try {
                    const newToken = await refreshAccessToken();
                    console.log("[fetchBranchDetails] 새 토큰 발급 성공:", newToken); // 새 토큰 확인
                    await getBranchDetails(newToken, branchCode);

                } catch (error) {
                    console.error("[fetchBranchDetails] 토큰 갱신 실패:", error);
                    alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
                    handleAdminLogout();
                }
            } else {
                console.error("[fetchBranchDetails] 예외 처리되지 않은 에러:", error);
                // console.error("There was an error fetching the branchs details!", error);
            }
        }
    };

    // 지점 상세 정보 얻어오기
    const getBranchDetails = async (token, branchCode) => {
        console.log("[getBranchDetails] 시작 - token:", token, "branchCode:", branchCode);

        if (!branchCode) {
            console.error("[getBranchDetails] branchCode가 없습니다!");
            return;
        }

        try {
            const url = `${process.env.REACT_APP_API_URL}/arentcar/manager/branchs/detail/${branchCode}`;
            console.log("[getBranchDetails] API 요청 URL:", url);
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });
            console.log("[getBranchDetails] 응답 성공:", response.data);
            setBranchDetails(response.data);
        } catch (error) {
            console.error("[getBranchDetails] 에러 발생:", error);
            if (error.response) {
                console.error("[getBranchDetails] 서버 응답 에러:", error.response.data);
            }
            throw error; // 상위로 에러 전달
        }
    };

    // 지점 상세 버튼 클릭
    const handleDetailClick = (row) => {

        const branchCode = row.branch_code;

        if (!row.branch_code) {
            console.error("Invalid branchCode:", branchCode);
            return;
        }
        setIsDetailPopUp(true);
        fetchBranchDetails(branchCode);
    };

    // 개점시간 입력 포맷 설정 (09:00)
    const formatPickupTime = (available_pickup_time) => {
        if (available_pickup_time && available_pickup_time.length === 4) {
            // '0900' -> '09:00'
            return `${available_pickup_time.slice(0, 2)}:${available_pickup_time.slice(2, 4)}`;
        }
        // 기본값으로 원래 시간 반환
        return available_pickup_time; // 
    };

    const handlePickupTimeChange = (e) => {
        const input = e.target.value.replace(/[^0-9:]/g, ""); // 숫자와 ':'만 허용
        const formatted = input.replace(":", ""); // ':' 제거한 값 (저장된 값이 09:00 이기 때문)

        // 최대 4자리까지만 상태 저장
        if (formatted.length <= 4) {
            if (formatted.length === 4 && !isValidTimeFormat(formatted)) {
                alert("00:00 ~ 23:59 까지만 입력할 수 있습니다.");
                // 잘못된 형식일 경우 상태 변경하지 않음
                return;
            }
            // 정상 입력이라면 상태 갱신
            setAvailablePickupTime(formatted);
        }
    };

    // 폐점시간 입력 포맷 설정 (09:00)
    const formatReturnTime = (available_return_time) => {
        if (available_return_time && available_return_time.length === 4) {
            return `${available_return_time.slice(0, 2)}:${available_return_time.slice(2, 4)}`;
        }
        return available_return_time; // 
    };

    const handleReturnTimeChange = (e) => {
        const input = e.target.value.replace(/[^0-9:]/g, "");
        const formatted = input.replace(":", "");

        if (formatted.length <= 4) {
            if (formatted.length === 4 && !isValidTimeFormat(formatted)) {
                alert("00:00 ~ 23:59 까지만 입력할 수 있습니다.");
                return;
            }
            setAvailableReturnTime(formatted);
        }
    };


    // 매장 전화번호 형식 변환 함수
    const formatBranchPhoneNumber = (branchPhoneNumber) => {
        if (!branchPhoneNumber) {
            return "";
        }

        // phoneNumber 숫자 형식일 때 (예: 01011112222)
        const phoneNumberStr = branchPhoneNumber.toString();


        // 이미 '-'가 포함된 경우 그대로 반환
        if (phoneNumberStr.includes('-')) {
            return phoneNumberStr;
        }

        if (phoneNumberStr.length === 10) {
            const phoneNumber1 = phoneNumberStr.slice(0, 3);
            const phoneNumber2 = phoneNumberStr.slice(3, 6);
            const phoneNumber3 = phoneNumberStr.slice(6, 10);

            return `${phoneNumber1}-${phoneNumber2}-${phoneNumber3}`;
        }
        return "";
    };

    const formatPhoneNumber = (branch_phone_number) => {
        if (branch_phone_number && branch_phone_number.length === 10) {
            // '0311234567'
            return `${branch_phone_number.slice(0, 3)}-${branch_phone_number.slice(3, 6)}-${branch_phone_number.slice(6, 10)}`;
        }
        // 기본값으로 원래 시간 반환
        return branch_phone_number;
    };


    // 차트 띄우기
    const fetchBranchReservations = async (token) => {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/branchs/reservation`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
        });

        setChartData(response.data);
    };

    // 지점별 예약 건수 가져오기
    const getBranchReservations = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            await fetchBranchReservations(token);
        } catch (error) {
            if (error.response && error.response.status === 403) {
                try {
                    const newToken = await refreshAccessToken();
                    await fetchBranchReservations(newToken);
                } catch (refreshError) {
                    alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
                    handleAdminLogout();
                }
            } else {
                console.error('There was an error fetching the branch reservations!', error);
            }
        }
    };

    useEffect(() => {
        getBranchReservations();
    }, []);

    const data = {
        labels: chartData?.map(branch => branch.branch_name) || [],
        datasets: [
            {
                data: chartData?.map(branch => Number(branch.reservation_code) || 0) || [],
                backgroundColor: ['red', 'green', 'blue', 'yellow', 'purple'],
            },
        ],
    };

    const options = {
        scales: {
            y: {
                ticks: {
                    stepSize: 1, // Y축 단위를 1로 설정
                    callback: function (value) {
                        return Number.isInteger(value) ? value : null; // 정수만 표시
                    },
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            // 범례 숨기기
            title: {
                display: true, // 제목 표시
                text: '예약 건수', // 제목 내용
                align: 'start', // 제목을 왼쪽 정렬
            },
        },
    };

    return (
        <div className='manager-branchs-reservation-chart-wrap'>
            <div className='manager-branchs-reservation-chart-chart-header-wrap'>

                {/* 헤더 */}
                <div className='manager-branchs-reservation-chart-title-wrap'>
                    <div className='manager-title'>● 전체 지점 예약 통계</div>
                </div>

                {/* 테이블 크기 일괄 조정 */}
                <div
                    className='manager-branchs-reservation-chart-table-button-wrap'
                    style={{ width: `${totalWidth}px` }}
                >

                    {/* 지점명 검색 버튼 */}
                    <div className='flex-align-center'>
                        <label className='manager-label' htmlFor="">지점명</label>
                        <input className='width200' type="text" value={searchBranchName} onChange={(e) => (setSearchBranchName(e.target.value))} />
                        <button className='manager-button manager-button-search' onClick={() => handleSearchClick()}>검색</button>
                        <span>[검색건수 : {totalCount}건]</span>
                    </div>

                    {/* 컴포넌트 닫기 */}
                    <div>
                        <button className='manager-button manager-button-close' onClick={() => handleCloseClick()}>닫기</button>
                    </div>
                </div>
            </div>

            {/* 차트 표시 */}
            <div className="chart-container">
                <Bar data={data} options={options} />
            </div>

            {/* 차트에 branchs 데이터 출력 */}
            <div className='manager-branchs-reservation-chart-content-wrap'>
                <div className='manager-branchs-reservation-chart-content-header'>
                    {columnDefs.map((title, index) => (
                        <div key={index} className='manager-head-column' style={{ width: `${title.width}px`, textAlign: `center` }}>{title.headerName}</div>
                    ))}
                </div>
                {/* map을 이용하여 columDefs 배열에 있는 내용 출력 */}
                <div className='manager-branchs-reservation-chart-table-content-wrap'>
                    {branchs.map((row, index) => (
                        <div key={index} className='manager-branchs-reservation-chart-content-row'>
                            {columnDefs.map((title, index) => (
                                <div
                                    key={index} className='manager-row-column'
                                    style={{
                                        ...(title.field === '' ? { display: 'flex' } : ''),
                                        ...(title.field === '' ? { alignItems: 'center' } : ''),
                                        ...(title.field === '' ? { justifyContent: 'center' } : ''),
                                        width: `${title.width}px`,
                                        textAlign: `${title.align}`
                                    }}
                                >
                                    {title.field === '' ? (
                                        <>
                                            <button className='manager-button manager-branch-button-detail' onClick={() => handleDetailClick(row)}>상세</button>
                                        </>
                                    ) : (
                                        <div>
                                            {(title.field === 'available_pickup_time' || title.field === 'available_return_time') ? (
                                                formatTime(row[title.field]) // 시간 필드만 09:00 형식으로 표시되게 포맷
                                            ) : title.field === 'branch_phone_number' ? (
                                                formatPhoneNumber(row[title.field]) // 전화번호 필드 포맷
                                            ) : (
                                                row[title.field] // 다른 필드는 그대로 출력
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* 다음, 이전 버튼 */}
                <div className='manager-branchs-reservation-chart-info-pageing-wrap flex-align-center'>
                    <button
                        className='manager-button'
                        style={{ color: pageNumber === 1 ? '#aaa' : 'rgb(38, 49, 155)' }}
                        onClick={() => handlePageChange(pageNumber - 1)}
                        disabled={pageNumber === 1}
                    >이전</button>
                    <div className='manager-branchs-reservation-chart-info-pageing-display'>{pageNumber} / {totalPages}</div> {/* 현재 페이지 / 전체 페이지 */}
                    <button
                        className='manager-button'
                        style={{ color: pageNumber === totalPages ? '#aaa' : 'rgb(38, 49, 155)' }}
                        onClick={() => handlePageChange(pageNumber + 1)}
                        disabled={pageNumber === totalPages}
                    >다음</button>
                </div>

                {/* 지점 상세 팝업 */}
                {isDetailPopUp &&
                    <div className='manager-branchs-reservation-chart-detail-popup manager-popup'>
                        <div className='manager-branchs-reservation-chart-content-popup-wrap'>
                            <div className='manager-branchs-reservation-chart-detail-popup-close'>
                                <div className='manager-popup-title'>● 지점상세 </div>
                                <div className='branch-info-content-popup-button'>
                                    <button className='manager-button manager-button-close' onClick={handlePopupCloseClick}>닫기</button>
                                </div>
                            </div>

                            {/* 지점코드 */}
                            <div className='manager-branch-popup-high-branch-id'>
                                <label>지점코드: </label>
                                <span> {branchDetails.branch_code}</span>
                            </div>

                            {/* 지점정보 */}
                            <div className="manager-branch-popup-section">
                                <div className="manager-branch-popup-section-title">지점정보</div>
                                <div className="manager-branch-popup-field-row">
                                    <label>지점명 : </label>
                                    <span>{branchDetails.branch_name}</span>
                                    <label>전화번호 : </label>
                                    <span>{formatBranchPhoneNumber(branchDetails.branch_phone_number)}</span>
                                </div>
                                <div className="manager-branch-popup-field-row">
                                    <label>기본주소 : </label>
                                    <span>{branchDetails.branch_basic_address}</span>
                                </div>
                                <div className="manager-branch-popup-field-row">
                                    <label>상세주소 : </label>
                                    <span>{branchDetails.branch_detailed_address}</span>
                                </div>
                            </div>

                            {/* 지역정보*/}
                            <div className="manager-branch-popup-section">
                                <div className="manager-branch-popup-section-title">지역정보</div>
                                <div className="manager-branch-popup-field-row">
                                    <label>지역코드 : </label>
                                    <span>{branchDetails.region_code}</span>
                                    <label>지역이름 : </label>
                                    <span>{branchDetails.region_name}</span>
                                </div>
                                <div className="manager-branch-popup-field-row">
                                    <label>우편번호 : </label>
                                    <span>{branchDetails.post_code}</span>
                                </div>
                                <div className="manager-branch-popup-field-row">
                                    <label>위도 : </label>
                                    <span>{branchDetails.branch_longitude}</span>
                                </div>
                                <div className="manager-branch-popup-field-row">
                                    <label>경도 : </label>
                                    <span>{branchDetails.branch_latitude}</span>
                                </div>
                            </div>

                            {/* 영업정보 */}
                            <div className="manager-branch-popup-section">
                                <div className="manager-branch-popup-section-title">영업정보</div>
                                <div className="manager-branch-popup-field-row">
                                    <label>개점시간 : </label>
                                    <span>{formatTime(branchDetails.available_pickup_time)}</span>
                                    <label>폐점시간 : </label>
                                    <span>{formatTime(branchDetails.available_return_time)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>

            {/* 로딩 모달 */}
            {loading && (
                <Loading />
            )}
        </div>
    );
};

export default AllBranchesReservationChart;
