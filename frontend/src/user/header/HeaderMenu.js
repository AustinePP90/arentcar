import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Link, useLocation } from 'react-router-dom';
=======
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUserState } from '../../redux/UserState';
>>>>>>> 951208bf89423d692882ff5d76df2ef9039ac76e
import axios from 'axios';
import 'user/header/HeaderMenu.css';

const HeaderMenu = () => {
  const [menus, setMenus] = useState([]);
<<<<<<< HEAD
  const [activeMenuMain, setActiveMenuMain] = useState(null);
  const [activeMenuSub, setActiveMenuSub] = useState(null);
  const [isHome, setIsHome] = useState(true);
  const location = useLocation();
=======
  const [isHome, setIsHome] = useState(true);
  const isUserName = useSelector((state) => state.userState.userName);
  const isLoginState = useSelector((state) => state.userState.loginState);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
>>>>>>> 951208bf89423d692882ff5d76df2ef9039ac76e

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/menus`);
        if (response.data) {
          setMenus(response.data);
        }
      } catch (error) {
        console.error('There was an error fetching the menu!', error);
      }
    };

    fetchMenus();
  }, []);

<<<<<<< HEAD
  useEffect(() => {
    if (location.pathname === "/") {
      setIsHome(true);
    } else {
      setIsHome(false);
    }
  }, [location]);

  const handleMenuMainMouseOver = (MainMenu) => {
    setActiveMenuMain(MainMenu);
  };

  const handleMenuMainMouseLeave = () => {
    setActiveMenuMain(null);
  };

  const handleMenuMainClick = (menu) => {
  };


  return (
    <div className='header-menu-wrap'>
      <div className='header-menu-top-logo'>
        <img className="manager-menu-logo-img" src={`${process.env.REACT_APP_IMAGE_URL}/arentcar.png`} alt="" />
=======
  // useEffect(() => {
  //   if (location.pathname === "/") {
  //     setIsHome(true);
  //   } else {
  //     setIsHome(false);
  //   }
  // }, [location]);

  const handleMenuMainClick = (menuUrl) => {
    navigate(menuUrl);
  };


  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogoutClick = () => {
    dispatch(setUserState({
      userCode: "",
      userName: "",
      userEmail: "",
      userCategory: "",	
      usageStatus: "",
      loginState: false,
    }));

    document.cookie = 'nid_aut=; path=/; domain=.naver.com; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    if (window.Kakao) {
      window.Kakao.Auth.logout(() => {
        console.log('카카오 로그아웃 완료');
      });
    }

    navigate('/');
  };

  return (
    <div className='header-menu-wrap'>
      <div className='header-menu-top-logo'>
        <img className="manager-menu-logo-img" src={`${process.env.REACT_APP_IMAGE_URL}/arentcar.png`} alt="" onClick={handleLogoClick} />
>>>>>>> 951208bf89423d692882ff5d76df2ef9039ac76e
      </div>
      <div className="header-menu-top-menu">
        <ul>
          {menus.filter(menu => menu.menu_kind === "1" && menu.menu_type === "1").map((mainMemu, index) => (
            <li
              key={index}
<<<<<<< HEAD
              onClick={() => handleMenuMainClick(mainMemu.menu_url)}
=======
              onClick={() => handleMenuMainClick(mainMemu.menu_component)}
>>>>>>> 951208bf89423d692882ff5d76df2ef9039ac76e
            >
              {mainMemu.menu_name}
            </li>
          ))}
        </ul>
      </div>
<<<<<<< HEAD
      <div className='header-menu-top-login'>
        <img className="manager-menu-login-img" src={`${process.env.REACT_APP_IMAGE_URL}/mypage.png`} alt="" />
      </div>
=======
      {isLoginState ?
        <div className='header-menu-top-login' onClick={handleLogoutClick}>
          <img className="manager-menu-login-img" src={`${process.env.REACT_APP_IMAGE_URL}/mypage.png`} alt="" />
          <span className="manager-menu-logout-btn">로그아웃</span>
          <span>({isUserName})</span>
        </div>
        :
        <div className='header-menu-top-login' onClick={handleLoginClick}>
          <img className="manager-menu-login-img" src={`${process.env.REACT_APP_IMAGE_URL}/mypage.png`} alt="" />
          <span className="manager-menu-login-btn">로그인</span>
          <span>회원가입</span>
        </div>
      }
>>>>>>> 951208bf89423d692882ff5d76df2ef9039ac76e
    </div>
  );
};

export default HeaderMenu;