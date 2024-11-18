import React from 'react';
import './Search.css'

const Search = () => {
    const hendelerClick = (e) =>{
        e.preventDefault()
    }
    return (
        <div className='search-wrap'>
            <h2 className='search-title'>검색</h2>
            <div id='line'></div>
            <p className='search-detail'>원하시는 일정에 맞춰 차종을 검색할 수 있습니다.</p>
            <div className='search-form-wrap'>
                <form id='search-form'>
                    <input type="date" id='rental-date' name='rental-date' onClick={hendelerClick}/>
                    <input type="date" id='return-date' name='return-date' />
                    <select name="languages" id="lang">
                        <option value="" selected disabled hidden>선택해주세요</option>
                        <option value="경차">경차</option>
                        <option value="소형">소형</option>
                        <option value="준중형">준중형</option>
                        <option value="중형">중형</option>
                        <option value="준대형">준대형</option>
                        <option value="대형">대형</option>
                        <option value="RV/SUV">RV/SUV</option>
                        <option value="스포츠카">스포츠카</option>
                    </select>
                    <button type='submit' id='submit-button'>검색하기</button>
                </form>
            </div>

        </div>
    );
}

export default Search;