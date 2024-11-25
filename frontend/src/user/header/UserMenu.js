import React from 'react';
<<<<<<< HEAD
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import HeaderMenu from 'user/header/HeaderMenu';
import ContentHome from 'user/content/ContentHome';
=======
import { Routes, Route } from 'react-router-dom';
import HeaderMenu from 'user/header/HeaderMenu';
import ContentHome from 'user/content/ContentHome';
import UserLogin from 'user/content/UserLogin';
import UserMemberShip from 'user/content/UserMemberShip';
import NaverCallback from 'user/content/NaverCallback';
import KakaoCallback from 'user/content/KakaoCallback';
>>>>>>> 951208bf89423d692882ff5d76df2ef9039ac76e
import FooterMain from 'user/footer/FooterMain';

const UserMenu = () => {
  return (
    <div className="user-menu-wrap">
      <div className='user-menu-header-wrap'>
        <HeaderMenu />
      </div>
      <div className='user-menu-content-wrap'>
        <Routes>
          <Route path="/" element={<ContentHome />} ></Route>
<<<<<<< HEAD
          {/* <Route path="/login" element={<UserLogin />} ></Route> */}
=======
          <Route path="/login" element={<UserLogin />} ></Route>
          <Route path="/membership" element={<UserMemberShip />} ></Route>
          <Route path="/naver-callback" element={<NaverCallback />} /> 
          <Route path="/kakao-callback" element={<KakaoCallback />} /> 
>>>>>>> 951208bf89423d692882ff5d76df2ef9039ac76e
        </Routes>
      </div>
      <div className='user-menu-footer-wrap'>
        <FooterMain />
      </div>
    </div>
  );
}

export default UserMenu;