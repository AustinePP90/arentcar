import React, { useState } from 'react';
import './ReservationCalender.css'; 

const ReservationCalender = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentMonteDate, setCurrentMonteDate] = useState(new Date());
    const [nextMonteDate, setNextMonteDate] = useState(new Date());
    const [selectedDay,setSelectedDay] = useState(currentDate.getDate());

    const year = currentMonteDate.getFullYear();
    const month = currentMonteDate.getMonth();
    const nextMonthYear = nextMonteDate.getFullYear();
    const nextMonth = nextMonteDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfNextMonth = new Date(year, month+1, 1);
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
        if(currentDate.getFullYear() < currentMonteDate.getFullYear() || currentDate.getMonth()+1 < currentMonteDate.getMonth()+1){
            setCurrentMonteDate(new Date(year, month - 1, 1));
            setNextMonteDate(new Date(year, month , 1));
        }
    };

    const goToNextMonth = () => {
        setCurrentMonteDate(new Date(year, month + 1, 1));
        setNextMonteDate(new Date(year, month + 2, 1));
    };

    const handleSelected = (day) => {
        console.log(day);
        setSelectedDay(day);
    };

    return (
        <div className='reservation-calendar-wrap'>
        <div className="reservation-calendar">
            <div className="reservation-calendar-header">
            <span>{year}년 {month + 1}월</span>
            <div className='reservation-calender-button-wrap'>
                <button onClick={goToPreviousMonth}>◀</button>
                </div>
            </div>
            <div className="reservation-calendar-grid">
                {daysOfWeek.map((day) => (
                    <div key={day} className="reservation-calendar-day-of-week">{day}</div>
                ))}
                {days.map((day, index) => (
                    <div key={index} className={`reservation-calendar-day 
                    ${selectedDay == day ? 'selected' : ''} 
                    ${day ? '' : 'empty'}
                    ${(currentDate.getMonth()+1 ==  currentMonteDate.getMonth()+1) &&currentDate.getDate() > day ? 'disabled-day':''}
                    `} onClick={() => handleSelected(day)}>
                        {day}
                    </div>
                ))}
            </div>
        </div>
        <div className="reservation-calendar">
        <div className="reservation-calendar-header">
        <span>{nextMonthYear}년 {nextMonth + 1}월</span>
        <div className='reservation-calender-button-wrap'>
            <button onClick={goToNextMonth}>▶</button>
            </div>
        </div>
        <div className="reservation-calendar-grid">
            {daysOfWeek.map((day) => (
                <div key={day} className="reservation-calendar-day-of-week">{day}</div>
            ))}
            {nextMonthDays.map((day, index) => (
                <div key={index} className={`reservation-calendar-day ${day ? '' : 'empty'}`}>
                    {day}
                </div>
            ))}
        </div>
    </div>
    </div>
    );
};

export default ReservationCalender;
