import React from 'react';
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import HeaderMenu from 'user/header/HeaderMenu';
import ContentHome from 'user/content/ContentHome';
import RentalCarsPage from 'reservations/RentalCarsPage';
import FooterMain from 'user/footer/FooterMain';
import Filter from 'reservations/Filter';

const UserMenu = () => {
  return (
    <div className="user-menu-wrap">
      <div className='user-menu-header-wrap'>
        <HeaderMenu />
      </div>
      <div className='user-menu-content-wrap'>
        <Routes>
          <Route path="/" element={<ContentHome />} ></Route>
          {/* <Route path="/login" element={<UserLogin />} ></Route> */}
        </Routes>
        <RentalCarsPage></RentalCarsPage>
      </div>
      <div className='user-menu-footer-wrap'>
        <FooterMain />
      </div>
    </div>
  );
}

export default UserMenu;