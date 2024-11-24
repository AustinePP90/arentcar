import React, { useEffect, useState } from 'react';
import './ReservationCalender.css';

const ReservationCalender = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonteDate, setCurrentMonteDate] = useState(new Date());
  const [nextMonteDate, setNextMonteDate] = useState(new Date());
  const [firstSelectedDay, setFirstSelectedDay] = useState(null);  // 첫 번째 달력 선택된 날짜
  const [secondSelectedDay, setSecondSelectedDay] = useState(null); // 두 번째 달력 선택된 날짜
  const [firstSelectedRange, setFirstSelectedRange] = useState([]); // 첫 번째 달력 날짜 범위
  const [secondSelectedRange, setSecondSelectedRange] = useState([]); // 두 번째 달력 날짜 범위

  const year = currentMonteDate.getFullYear();
  const month = currentMonteDate.getMonth();
  const nextMonthYear = nextMonteDate.getFullYear();
  const nextMonth = nextMonteDate.getMonth() + 1;

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfNextMonth = new Date(year, month + 1, 1);
  const lastDayOfNextMonth = new Date(year, month + 2, 0);

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

  const days = [];
  for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
    days.push('');
  }
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    days.push(i);
  }

  const nextMonthDays = [];
  for (let i = 0; i < firstDayOfNextMonth.getDay(); i++) {
    nextMonthDays.push('');
  }
  for (let i = 1; i <= lastDayOfNextMonth.getDate(); i++) {
    nextMonthDays.push(i);
  }

  const goToPreviousMonth = () => {
    if (
      currentDate.getFullYear() < currentMonteDate.getFullYear() ||
      currentDate.getMonth() + 1 < currentMonteDate.getMonth() + 1
    ) {
      setCurrentMonteDate(new Date(year, month - 1, 1));
      setNextMonteDate(new Date(year, month, 1));
    }
  };

  const goToNextMonth = () => {
    setCurrentMonteDate(new Date(year, month + 1, 1));
    setNextMonteDate(new Date(year, month + 2, 1));
  };

  const handleSelected = (day, isNextMonth) => {
    if (isNextMonth) {
      // 두 번째 달력에서 날짜를 선택한 경우
      setSecondSelectedDay(day);
      // 두 날짜를 기준으로 범위를 계산하여 상태에 저장
      const range = getRange(firstSelectedDay, secondSelectedDay, 'second');
      setSecondSelectedRange(range);
    } else {
      // 첫 번째 달력에서 날짜를 선택한 경우
      setFirstSelectedDay(day);
      // 첫 번째 달력 범위 계산
      const range = getRange(firstSelectedDay, secondSelectedDay, 'first');
      setFirstSelectedRange(range);
    }
  };

  const getRange = (startDay, endDay, calendarType) => {
    const range = [];
    if (calendarType === 'first') {
      const startDate = startDay;
      if(endDay != null){

      }
      const endDate = lastDayOfMonth.getDate();
      for (let i = startDate; i <= endDate; i++) {
        range.push(i);
      }
    } else if (calendarType === 'second') {
      const startDate = 1;
      const endDate = endDay;
      for (let i = startDate; i <= endDate; i++) {
        range.push(i);
      }
    }
    return range;
  };

  useEffect(() => {
    setNextMonteDate(new Date(year, month + 1, 1));
  }, []);

  const isDayInFirstRange = (day) => firstSelectedRange.includes(day);
  const isDayInSecondRange = (day) => secondSelectedRange.includes(day);

  return (
    <div className='reservation-calendar-wrap'>
      <div className="reservation-calendar">
        <div className="reservation-calendar-header">
          <div className='reservation-calender-button-wrap'>
            <button onClick={goToPreviousMonth}>◀</button>
          </div>
          <span>{year}년 {month + 1}월</span>
        </div>
        <div className="reservation-calendar-grid">
          {daysOfWeek.map((day) => (
            <div key={day} className="reservation-calendar-day-of-week">{day}</div>
          ))}
          {days.map((day, index) => (
            <div
              key={index}
              className={`reservation-calendar-day
                ${isDayInFirstRange(day) ? 'selected-range' : ''}
                ${firstSelectedDay === day ? 'selected' : ''}
                ${day ? '' : 'empty'}
                ${currentDate.getMonth() + 1 === currentMonteDate.getMonth() + 1 && currentDate.getDate() > day ? 'disabled-day' : ''}
              `}
              onClick={() => handleSelected(day, false)} // 첫 번째 달력에서 클릭
            >
              {day}
            </div>
          ))}
        </div>
      </div>
      <div className="reservation-calendar">
        <div className="reservation-calendar-header">
          <span>{nextMonthYear}년 {nextMonth}월</span>
          <div className='reservation-calender-button-wrap'>
            <button onClick={goToNextMonth}>▶</button>
          </div>
        </div>
        <div className="reservation-calendar-grid">
          {daysOfWeek.map((day) => (
            <div key={day} className="reservation-calendar-day-of-week">{day}</div>
          ))}
          {nextMonthDays.map((day, index) => (
            <div
              key={index}
              className={`reservation-calendar-day 
                ${isDayInSecondRange(day) ? 'selected-range' : ''}
                ${secondSelectedDay === day ? 'selected' : ''}
                ${day ? '' : 'empty'}
              `}
              onClick={() => handleSelected(day, true)} // 두 번째 달력에서 클릭
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReservationCalender;
