import axios from 'axios';
import React, { useEffect, useState } from 'react';
import 'reservations/Filter.css';

const Filter = (props) => {
    const [carType, setCarType] = useState([]);
    const [carManufacturer, setCarManufacturer] = useState([]);
    const [fuelType, setFuelType] = useState([]);
    const [seatingCapacity, setSeatingCapacity] = useState([]);
    const [modelYear, setModelYear] = useState([]);

    const [clickedButtons, setClickedButtons] = useState(new Set());

    const toggleButtonClick = (buttonKey) => {
        setClickedButtons((prevClicked) => {
            const newClicked = new Set(prevClicked);
            if (newClicked.has(buttonKey)) {
                newClicked.delete(buttonKey); // 버튼이 클릭된 상태면 해제
            } else {
                newClicked.add(buttonKey); // 버튼 클릭 상태로 변경
            }
            return newClicked;
        });
    };

    useEffect(() => {
        const fetchCarType = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/user/filter/cartype`);
                if (response.data) {
                    setCarType(response.data);
                }
            } catch (error) {
                console.error('There was an error fetching the car types!', error);
            }
        };
        const fetchCarManufacturer = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/user/filter/carmanufacturer`);
                if (response.data) {
                    setCarManufacturer(response.data);
                }
            } catch (error) {
                console.error('There was an error fetching the car manufacturers!', error);
            }
        };
        const fetchFuelType = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/user/filter/fueltype`);
                if (response.data) {
                    setFuelType(response.data);
                }
            } catch (error) {
                console.error('There was an error fetching the fuel types!', error);
            }
        };
        const fetchSeatingCapacity = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/user/filter/seatingcapacity`);
                if (response.data) {
                    setSeatingCapacity(response.data);
                }
            } catch (error) {
                console.error('There was an error fetching the seating capacities!', error);
            }
        };
        const fetchModelYear = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/user/filter/modelyear`);
                if (response.data) {
                    setModelYear(response.data);
                }
            } catch (error) {
                console.error('There was an error fetching the model years!', error);
            }
        };

        fetchCarType();
        fetchCarManufacturer();
        fetchFuelType();
        fetchSeatingCapacity();
        fetchModelYear();
    }, []);

    return (
        <div className='filter-background'>
            <div className='filter-wrap'>
                <div className='filter-header'>
                    <h2>필터</h2>
                    <button className='close-button' onClick={props.handleFilterCloseClick}>
                        <img src={`${process.env.REACT_APP_IMAGE_URL}/close_btn.png`} alt="" />
                    </button>
                </div>
                <div className='filter-item-wrap'>
                    <div className='filter-item'>
                        <h3>차종</h3>
                        {carType.map((cartype, index) => (
                            <button
                                className={`filter-button ${clickedButtons.has(`carType-${index}`) ? 'clicked' : ''}`}
                                key={index}
                                onClick={() => toggleButtonClick(`carType-${index}`)}
                            >
                                {cartype.car_type_name}
                            </button>
                        ))}
                    </div>
                    <div className='filter-item'>
                        <h3>제조사</h3>
                        {carManufacturer.map((carmanufacturer, index) => (
                            <button
                                className={`filter-button ${clickedButtons.has(`carManufacturer-${index}`) ? 'clicked' : ''}`}
                                key={index}
                                onClick={() => toggleButtonClick(`carManufacturer-${index}`)}
                            >
                                {carmanufacturer.car_manufacturer}
                            </button>
                        ))}
                    </div>
                    <div className='filter-item'>
                        <h3>연료</h3>
                        {fuelType.map((fueltype, index) => (
                            <button
                                className={`filter-button ${clickedButtons.has(`fuelType-${index}`) ? 'clicked' : ''}`}
                                key={index}
                                onClick={() => toggleButtonClick(`fuelType-${index}`)}
                            >
                                {fueltype.fuel_type}
                            </button>
                        ))}
                    </div>
                    <div className='filter-item'>
                        <h3>인승</h3>
                        {seatingCapacity.map((seatingcapacity, index) => (
                            <button
                                className={`filter-button ${clickedButtons.has(`seatingCapacity-${index}`) ? 'clicked' : ''}`}
                                key={index}
                                onClick={() => toggleButtonClick(`seatingCapacity-${index}`)}
                            >
                                {seatingcapacity.seating_capacity}
                            </button>
                        ))}
                    </div>
                    <div className='filter-item'>
                        <h3>연식</h3>
                        {modelYear.map((modelyear, index) => (
                            <button
                                className={`filter-button ${clickedButtons.has(`modelYear-${index}`) ? 'clicked' : ''}`}
                                key={index}
                                onClick={() => toggleButtonClick(`modelYear-${index}`)}
                            >
                                {modelyear.model_year}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Filter;
