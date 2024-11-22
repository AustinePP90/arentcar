import React, { useEffect, useState } from 'react';
import CarList from './CarList';
import './ReservationPage.css';
import axios from 'axios';
import CarSearchFilter from './CarSearchFilter';
import ReservationCalender from './ReservationCalender';

const RentalCarsPage = () => {
    const [filtersState, setFiltersState] = useState({});
    const [selectedFilters, setSelectedFilters] = useState({});

    const filters = [
        {
          id: "branchName",
          label: "지점",
          api: `${process.env.REACT_APP_API_URL}/arentcar/user/branchs`,
          displayKey: "branch_name",
        },
        {
          id: "fuelType",
          label: "연료 타입",
          api: `${process.env.REACT_APP_API_URL}/arentcar/user/filter/fueltype`,
          displayKey: "fuel_type",
        },
        {
          id: "carTypeCategory",
          label: "차종",
          api: `${process.env.REACT_APP_API_URL}/arentcar/user/filter/cartypecategory`,
          displayKey: "car_type_category",
        },
        {
          id: "carManufacturer",
          label: "제조사",
          api: `${process.env.REACT_APP_API_URL}/arentcar/user/filter/carmanufacturer`,
          displayKey: "car_manufacturer",
        },
        {
            id: "seatingCapacity",
            label: "인승구분",
            api: `${process.env.REACT_APP_API_URL}/arentcar/user/filter/seatingcapacity`,
            displayKey: "seating_capacity",
          },
      ];
      
  
    useEffect(() => {
      const fetchFilters = async () => {
        const newFiltersState = {};
  
        await Promise.all(
          filters.map(async (filter) => {
            try {
              const response = await axios.get(filter.api);
              newFiltersState[filter.id] = response.data;
            } catch (error) {
              console.error(`Error fetching ${filter.label}:`, error);
            }
          })
        );
  
        setFiltersState(newFiltersState);
      };
  
      fetchFilters();
    }, []);
  
    const handleFilterChange = (id, value) => {
      setSelectedFilters((prev) => ({
        ...prev,
        [id]: value,
      }));
    };

    const handleResetFilter = () => {
        setSelectedFilters({});
    }
  
    return (
      <div className="rental-cars-page-wrap">
        <ReservationCalender></ReservationCalender>
        <div className="rental-cars-page-header-wrap">
          <h2 className="rental-cars-page-header-title">단기렌트카</h2>
        </div>
        <div className="rental-cars-page-content-wrap">
            <CarList {...selectedFilters} />
          <div className="rental-cars-page-content-filter-wrap">
            <h3 className='rental-cars-page-content-filter-title'>검색옵션 선택</h3>
            {filters.map((filter) => (
              <CarSearchFilter
                key={filter.id}
                label={filter.label}
                optionList={filtersState[filter.id] || []}
                selectedOption={selectedFilters[filter.id]}
                displayKey={filter.displayKey}
                onOptionClick={(value) => handleFilterChange(filter.id, value)}
              />
            ))}
            <button className='rental-cars-page-content-filter-reset-button' onClick={handleResetFilter}>초기화</button>
          </div>
        </div>
      </div>
    );
  };
  
  export default RentalCarsPage;
