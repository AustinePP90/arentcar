import React from 'react';
import './SelectBranch.css'

const SelectBranch = ({branchName,hendelResetBranch,hendelSelectPeriod,onClick}) => {
    
    return (
        <div className='select-branch-wrap'>
            <div className='select-branch-rental-location-wrap'>
                <span className='select-branch-rental-location-title'>대여 장소</span>
                <div className='select-branch-rental-location'>
                    <img src={`${process.env.REACT_APP_IMAGE_URL}/location_icon.svg`} alt="" />
                    <p onClick={hendelResetBranch}>{branchName === '' ? '어디에서 대여할까요?':branchName}</p>
                </div>
            </div>
            <div className='select-branch-rental-period-wrap'>
                <div className='select-branch-rental-period'>
                    <span className='select-branch-rental-location-title'>대여 기간</span>
                    <div className='select-branch-rental-location'>
                        <img src={`${process.env.REACT_APP_IMAGE_URL}/clock_icon.svg`} alt="" />
                        <p>강남지점</p>
                    </div>
                </div>
                <button className='select-branch-button' onClick={hendelSelectPeriod}>검색</button>
            </div>
        </div>
    );
}

export default SelectBranch;