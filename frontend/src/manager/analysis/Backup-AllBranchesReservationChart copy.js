// 전체 지점 예약 통계
import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import DatePicker from 'react-datepicker'; // 달력 라이브러리
import { ko } from 'date-fns/locale'; // 달력을 한글로 바꾸기
import 'react-datepicker/dist/react-datepicker.css';
import './AllBranchesReservationChart.css';
import 'index.css';
import axios from 'axios';
import { endOfMonth, startOfMonth } from 'date-fns';
import { subDays } from 'date-fns';
import { format } from 'date-fns';
import { refreshAccessToken, handleLogout } from 'common/Common';

// 차트 라이브러리의 필요한 요소를 등록
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const AllBranchesReservationChart = () => {
    // 캘린더 시작 날짜와 종료 날짜
    const [startDate, setStartDate] = useState(subDays(new Date(), 7)); // 오늘 기준 일주일 전
    const [endDate, setEndDate] = useState(new Date()); // 오늘 날짜
    const [chartData, setChartData] = useState([]);
    // 선택된 일별 & 월별 필터 상태
    const [filter, setFilter] = useState('daily');

    // 일별, 월별 텍스트 필터
    const filterText = filter === 'daily' ? '일별 전체 지점 예약 현황' : '월별 전체 지점 예약 현황';

    // 일별, 월별 선택용 핸들러
    const handleFilterChange = (event) => {
        setFilter(event.target.value); // 선택된 값을 차트 이름에 반영
        setStartDate(null); //필터 변경 시 기존 날짜 초기화
        setEndDate(null);
    };

    const fetchBranchReservations = async (token) => {
        if (!startDate || !endDate) return;

        let formattedStartDate, formattedEndDate;

        if (filter === 'daily') {
            formattedStartDate = startDate.toISOString().slice(0, 10).replace(/-/g, '');
            formattedEndDate = endDate.toISOString().slice(0, 10).replace(/-/g, '');
        } else if (filter === 'monthly') {
            formattedStartDate = format(startOfMonth(startDate), 'yyyyMMdd');
            formattedEndDate = format(endOfMonth(endDate), 'yyyyMMdd');
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/branchs/reservation`, {
            params: { startDate: formattedStartDate, endDate: formattedEndDate },
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
        });

        setChartData(response.data);
    };

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
                    handleLogout();
                }
            } else {
                console.error('There was an error fetching the branch reservations!', error);
            }
        }
    };

    useEffect(() => {
        getBranchReservations();
    }, [startDate, endDate, filter]);

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
        <div className="reservation-statistics-list">
            {/* 통계 필터 */}
            <div className="daily-and-monthly-filter-head">
                <div>● 전체 지점 예약 통계 </div>
            </div>

            {/* 일별, 월별 필터 */}
            <div className="daily-and-monthly-filter-row">
                <select className="manager-row-column h6" value={filter} onChange={handleFilterChange}>
                    <option className="option-dropdown" value="daily">일별</option>
                    <option className="option-dropdown" value="monthly">월별</option>
                </select>

                {/* 시작 날짜 */}
                <div className="date-picker-container">
                    <label className="manager-label">시작일: </label>
                    <DatePicker
                        locale={ko}
                        dateFormat={filter === 'daily' ? "yyyy년 MM월 dd일" : "yyyy년 MM월"}
                        dateFormatCalendar={filter === 'daily' ? "yyyy년 MM월" : "yyyy년"}
                        showMonthYearPicker={filter === 'monthly'}
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        placeholderText={filter === 'daily' ? "시작 날짜 선택" : "시작 월 선택"}
                        startDate={startDate}
                        endDate={endDate}
                        maxDate={new Date()} // 시작일, 종료일이 오늘 날짜 이상으로 넘어가지 않음

                    />
                </div>

                {/* 종료 날짜 */}
                <div className="date-picker-container">
                    <label className="manager-label">종료일: </label>
                    <DatePicker
                        locale={ko}
                        dateFormat={filter === 'daily' ? "yyyy년 MM월 dd일" : "yyyy년 MM월"}
                        dateFormatCalendar={filter === 'daily' ? "yyyy년 MM월" : "yyyy년"}
                        showMonthYearPicker={filter === 'monthly'}
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        placeholderText={filter === 'daily' ? "종료 날짜 선택" : "종료 월 선택"}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate} // 최소 기간은 선택한 날짜부터 시작 됨
                        maxDate={new Date()} // 시작일, 종료일이 오늘 날짜 이상으로 넘어가지 않음
                    />
                </div>
            </div>

            <div className="chart-container">
                <h3>{filterText}</h3>
                <Bar data={data} options={options} />
            </div>
        </div>
    );
};

export default AllBranchesReservationChart;
