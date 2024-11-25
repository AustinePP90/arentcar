import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HeaderMenu from 'user/header/HeaderMenu';
import ContentHome from 'user/content/ContentHome';
import UserLogin from 'user/content/UserLogin';
import UserMemberShip from 'user/content/UserMemberShip';
import NaverCallback from 'user/content/NaverCallback';
import KakaoCallback from 'user/content/KakaoCallback';
import FooterMain from 'user/footer/FooterMain';
import ReservationPage from 'reservations/ReservationPage';
import ReservationDetail from 'reservations/ReservationDetail';

const UserMenu = () => {
  return (
    <div className="user-menu-wrap">
      <div className='user-menu-header-wrap'>
        <HeaderMenu />
      </div>
      <div className='user-menu-content-wrap'>
        <Routes>
          <Route path="/" element={<ContentHome />} ></Route>
          <Route path="/login" element={<UserLogin />} ></Route>
          <Route path="/membership" element={<UserMemberShip />} ></Route>
          <Route path="/naver-callback" element={<NaverCallback />} /> 
          <Route path="/kakao-callback" element={<KakaoCallback />} /> 
          <Route path="/reservation" element={<ReservationPage />} /> 
          <Route path="/reservationdetail" element={<ReservationDetail />} /> 
        </Routes>
      </div>
      <div className='user-menu-footer-wrap'>
        <FooterMain />
      </div>
    </div>
  );
}

export default UserMenu;