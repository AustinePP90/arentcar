// 차종별 예약 통계
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { refreshAccessToken, handleLogout as handleAdminLogout} from 'common/Common';
import Loading from 'common/Loading';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './Charts.css';

// 차트 라이브러리의 필요한 요소를 등록
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const AllCarTypeReservation = ({ onClick }) => {
    const isLoginState = useSelector((state) => state.adminState.loginState);

    const [vehicles, setVehicles] = useState([]) // DB에서 읽어온 차종 데이터
    const [vehiclesTrigger, setVehiclesTrigger] = useState(false);
    const [searchName, setSearchName] = useState("");
    const [searchCarType, setSearchCarType] = useState(""); // 차종명 검색

    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 7); // 일주일 전
        return date.toISOString().split('T')[0].replace(/-/g, ''); // "YYYYMMDD" 형식으로 변환
    });
    const [endDate, setEndDate] = useState(() => {
        const date = new Date();
        return date.toISOString().split('T')[0].replace(/-/g, ''); // "YYYYMMDD" 형식으로 변환
    });

    const formatDate = (dateStr) => {
        return dateStr ? `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}` : '';
    };


    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(1); // 페이지 번호
    const [totalCount, setTotalCount] = useState(0); // 총 검색 건수
    const [chartData, setChartData] = useState([]);
    const [isSearched, setIsSearched] = useState(false); // 차종명 검색 여부 상태 추가
    const pageSize = 10;

    const [columnDefs] = useState([
        { headerName: '코드', field: 'car_type_code', width: 85, align: 'center' },
        { headerName: '차종구분', field: 'car_type_category', width: 85, align: 'center' },
        { headerName: '국산/수입', field: 'origin_type', width: 85, align: 'center' },
        { headerName: '차종명', field: 'car_type_name', width: 150, align: 'center' },
        { headerName: '인승', field: 'seating_capacity', width: 85, align: 'center' },
        { headerName: '연료', field: 'fuel_type', width: 85, align: 'center' },
        { headerName: '속도제한', field: 'speed_limit', width: 85, align: 'center' },
        { headerName: '면허제한', field: 'license_restriction', width: 85, align: 'center' },
        { headerName: '제조사', field: 'car_manufacturer', width: 85, align: 'center' },
        { headerName: '년식', field: 'model_year', width: 85, align: 'center' },
    ]);

    // 차트에 사용될 파스텔 색상들
    const pastelColors = [
        '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
        '#C2B0FF', '#FFB2FF', '#FF8D8D', '#FFAEAE', '#E6FFFB',
        '#FFC9F9', '#FFDDC1'
    ];

    useEffect(() => {
        if (!isLoginState) {
            alert("로그인이 필요합니다.");
            return;
        }

        pageingVehicles();
        getTotalCount();
    }, [pageNumber, vehiclesTrigger]);

    const pageingVehicles = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            await getVehicles(token);
        } catch (error) {
            if (error.response && error.response.status === 403) {
                try {
                    const newToken = await refreshAccessToken();
                    await getVehicles(newToken);
                } catch (error) {
                    alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
                    handleAdminLogout();
                }
            } else {
                console.error('There was an error fetching the vehicles pageing!', error);
            }
        }
    };

    const getVehicles = async (token) => {
        const params = {
            pageSize,
            pageNumber,
        };

        if (searchName && searchName.trim() !== '') {
            params.carTypeName = searchName;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/cars/paged`,
            {
                params,
                headers: {
                    Authorization: `Bearer ${token}`
                },
                withCredentials: true,
            });

        if (response.data && response.data.length > 0) {  // 배열인 경우
            setVehicles(response.data);
        } else if (response.data && Object.keys(response.data).length > 0) {  // 객체인 경우
            setVehicles(response.data);
        } else {
            alert("조건에 맞는 차종명이 없습니다.");
            setVehicles(response.data);
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
                console.error('There was an error fetching the vehicles count!', error);
            }
        }
    };

    const getCount = async (token) => {
        const params = searchName ? { carTypeName: searchName } : {};

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/cars/count`,
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

    // 검색 버튼
    const handleSearchClick = async () => {

        // 검색어를 입력하지 않은 경우
        if (!searchCarType || searchCarType.trim() === '') {
            alert("검색할 지점명을 입력해주세요!");
            return;
        }

        try {
            const token = localStorage.getItem('accessToken')

            // DB에서 검색 결과 가져오기
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/cars/paged`, {
                params: { branchName: searchCarType.trim() },
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            // 검색 결과가 없는 경우
            if (response.data.length === 0) {
                alert("존재하지 않는 지점명입니다. 다시 입력해주세요.");
                return;
            }

            // 검색 결과가 있는 경우
            pageingVehicles();
            getTotalCount();
            setVehicles(response.data);
            setIsSearched(true); // 검색 후 상태 업데이트

        } catch (error) {
            console.error("Error during branch search:", error);
            alert("검색 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    };

    // 검색어 초기화 함수
    const handleSearchReset = () => {
        setSearchCarType(''); // 검색어 초기화
        setVehicles([]); // 검색 결과 초기화
        setStartDate(''); // 예약 시작일 초기화
        setEndDate(''); // 예약 종료일 초기화
        setLoading(false); // 로딩 상태 초기화
        setIsSearched(false); // 검색 여부 초기화
    };

    // `searchCarType`이 변경되었을 때 (차종명을 검색했을 때) 데이터 다시 로드
    // 해당 useEffect가 없으면 방금 전 검색했던 차종명만 테이블에 표시 된다.
    useEffect(() => {
        if (searchCarType === '') {
            pageingVehicles();
            getTotalCount();
        }
    }, [searchCarType]);

    const fetchCarTypesReservations = async (token) => {
        if (!startDate || !endDate) return;

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/rentalcars`, {
            params: { startDate, endDate},
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
        });

        setChartData(response.data);
        console.log(response.data);
    };

    const getCarTypesReservations = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            await fetchCarTypesReservations(token);
        } catch (error) {
            if (error.response && error.response.status === 403) {
                try {
                    const newToken = await refreshAccessToken();
                    await fetchCarTypesReservations(newToken);
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
        getCarTypesReservations();
    }, [startDate, endDate]);

    const data = {
        labels: chartData.map(carsType => carsType.car_type_name) || [],  // 차종 이름
        datasets: [
            {
                data: chartData?.map(reservations => Number(reservations.reservation_code) || 0),
                backgroundColor: pastelColors,
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
                display: false, // 범례 숨기기
            },
            title: {
                display: true, // 제목 표시
                text: '예약 건수', // 제목 내용
                align: 'start', // 제목을 왼쪽 정렬
            },
            datalabels: {
                display: true,
                color: '#000000',  // 퍼센트 텍스트 색상
                font: {
                    weight: 'bold',
                    size: 14,
                },
                formatter: function (value, context) {
                    const total = context.dataset.data.reduce((acc, val) => acc + val, 0); // 전체 값 계산
                    const percentage = ((value / total) * 100).toFixed(0); // 퍼센트 계산
                    const carTypes = context.chart.data.labels[context.dataIndex]; // 차종 이름
                    return `${carTypes}: ${percentage}%`; // 차종 이름과 퍼센트 표시
                },
            },
        },
    };
    
    return (
        <div className='manager-branchs-reservation-chart-wrap'>
            <div className='manager-branchs-reservation-chart-chart-header-wrap'>

                {/* 헤더 */}
                <div className='manager-branchs-reservation-chart-title-wrap'>
                    <div className='manager-title'>● 차종별 예약 통계</div>
                </div>

                {/* 테이블 크기 일괄 조정 */}
                <div
                    className='manager-branchs-reservation-chart-table-button-wrap'
                    style={{ width: `${totalWidth}px` }}
                >

                    {/* 차종명 검색 버튼 */}
                    <div className='flex-align-center'>
                        <label className='manager-label' htmlFor="">차종명</label>
                        <input className='width200' type="text" value={searchCarType} onChange={(e) => (setSearchCarType(e.target.value))} />

                        {/* 예약 시작일 */}
                        <input
                            type="date"
                            value={formatDate(startDate)}
                            onChange={(e) => setStartDate(e.target.value.replace(/-/g, ''))} // "YYYYMMDD" 형식으로 저장
                            max={new Date().toISOString().slice(0, 10)}
                        />

                        {/* 예약 종료일 */}
                        <input
                            type="date"
                            value={formatDate(endDate)}
                            onChange={(e) => setEndDate(e.target.value.replace(/-/g, ''))} // "YYYYMMDD" 형식으로 저장
                            min={startDate}
                            max={new Date().toISOString().slice(0, 10)}
                        />

                        {/* 검색 버튼 */}
                        <button className='manager-button manager-button-search' onClick={() => handleSearchClick()}>검색</button>
                        <span>[검색건수 : {totalCount}건]</span>
                    </div>

                    {/* 컴포넌트 초기화 및 닫기 */}
                    <div>
                        <button className='manager-button manager-button-reset'
                            onClick={handleSearchReset}
                            disabled={!isSearched}
                            style={{
                                color: isSearched ? 'rgb(38, 49, 155)' : '#AAAAAA', // 조건에 맞게 color 변경
                                cursor: isSearched ? 'pointer' : 'not-allowed', // disabled일 때 커서 스타일 변경
                            }}>초기화
                        </button>
                        <button className='manager-button manager-button-close' onClick={() => handleCloseClick()}>닫기</button>
                    </div>
                </div>
            </div>

            {/* 차트 표시 */}
            <div className="chart-container">
                {chartData.length > 0 ? (
                    <Bar data={data} options={options} />
                ) : (
                    <p>데이터를 불러오는 중입니다...</p>
                )}
            </div>


            {/* 테이블에 cartypes 데이터 출력 */}
            <div className='manager-branchs-reservation-chart-content-wrap'>

                {/* 테이블 헤더 */}
                <div className='manager-branchs-reservation-chart-content-header'>
                    {columnDefs.map((title, index) => (
                        <div key={index} className='manager-head-column' style={{ width: `${title.width}px`, textAlign: `center` }}>{title.headerName}</div>
                    ))}
                </div>

                {/* 테이블 내용 */}
                <div className='manager-branchs-reservation-chart-table-content-wrap'>
                    {vehicles.map((row, index) => (
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
                                > {row[title.field]}
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
            </div>

            {/* 로딩 모달 */}
            {loading && (
                <Loading />
            )}
        </div>
    );
};

export default AllCarTypeReservation;
