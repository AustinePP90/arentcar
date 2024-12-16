import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'user/content/RantalLocationSelector.css';
import { use } from 'react';

const RantalLocationSelector = () => {
    const [regions, setRegions] = useState([]);
    const [branchs, setBranchs] = useState([]);
    const [selectRegion, setSelectRegion] = useState('경기'); // 현재 선택된 지역
    const [selectBranch, setSelectBranch] = useState('');
    const [isSelectBranch, setIsSelectBranch] = useState(false); // 닫기/열기 상태
    const [expandedRegion, setExpandedRegion] = useState(null); // 하위 지점 표시를 위한 상태
    const [carTypeCategory, setCarTypeCategory] = useState([]);
    const [selectCarTypeCategory, setSelectCarTypeCategory] = useState([]);

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/user/cars/regions`);
                if (response.data) {
                    setRegions(response.data);
                }
            } catch (error) {
                console.error('Error fetching regions:', error);
            }
        };
        const fetchCarTypeCategory = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/user/cars/filter/cartypecategory`);
                if (response.data) {
                    setCarTypeCategory(response.data);
                }
            } catch (error) {
                console.error('Error fetching regions:', error);
            }
        };

        fetchRegions();
        fetchCarTypeCategory();
    }, []);

    const handleRegionClick = async (regionName) => {
        if (expandedRegion === regionName) {
            setExpandedRegion(null); // 토글 기능: 이미 열려 있으면 닫기
            return;
        }

        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/user/cars/branchs`, {
                params: { region: regionName },
            });
            if (response.data) {
                setBranchs(response.data);
            }
            setExpandedRegion(regionName); // 클릭된 지역을 확장
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    const handleSelectBranchClick = () => {
        setIsSelectBranch(true);
    };

    const handleCloseButtonClick = () => {
        setIsSelectBranch(false);
        setExpandedRegion(null); // 닫을 때 하위 지점도 닫기
    };

    const handleBranchSelect = (branchName) => {
        setSelectBranch(branchName);
        setIsSelectBranch(false); // 지점 선택 후 창 닫기
    };

    return (
        <div className="rental-location-selector-wrap">
            {!isSelectBranch && (
                <>
                    <div className="rental-location-selector-select-branch" onClick={handleSelectBranchClick}>
                        {selectBranch ? selectBranch : '지점선택'}
                    </div>
                    <div className="rental-location-selector-select-date">날짜</div>
                    <div className="rental-location-selector-select-car-type">
                        <div className="rental-location-selector-select-car-type-title">차종</div>
                        <div className="rental-location-selector-select-car-type-item">전체</div>
                        {carTypeCategory.length > 0 ?
                            carTypeCategory.map((carType, index) => (
                                <div key={index} className='rental-location-selector-select-car-type-item'> {/* 안전한 접근: 개별 요소를 확인 */}
                                    {carType.car_type_category}
                                </div>
                            )) : ''
                        }
                    </div>
                    <div className='rental-location-selector-button-wrap'>
                        <button className='rental-location-selector-button'>차량 조회하기</button>
                    </div>
                </>
            )}
            {isSelectBranch && (
                <div>
                    <div className="rental-location-selector-select-branch-detail-wrap">
                        <div className="rental-location-selector-select-branch-detail-header">
                            <h2 className="rental-location-selector-select-branch-detail-header-title">어디로 갈까요?</h2>
                            <img
                                src={`${process.env.REACT_APP_IMAGE_URL}/close_icon.svg`}
                                alt=""
                                onClick={handleCloseButtonClick}
                            />
                        </div>
                        <div className="rental-location-selector-select-branch-regions-wrap">
                            {regions.map((region) => (
                                <div key={region.region_name}>
                                    <div
                                        className="rental-location-selector-select-branch-regions-item"
                                        onClick={() => handleRegionClick(region.region_name)}
                                    >
                                        {region.region_name}
                                    </div>
                                    {expandedRegion === region.region_name && (
                                        <div className="rental-location-selector-select-branch-item">
                                            {branchs.map((branch) => (
                                                <div
                                                    key={branch.branch_name}
                                                    className="rental-location-selector-select-branch-name"
                                                    onClick={() => handleBranchSelect(branch.branch_name)}
                                                >
                                                    {branch.branch_name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RantalLocationSelector;
