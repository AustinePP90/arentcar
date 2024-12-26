import React, { useState, useEffect } from "react";
import axios from "axios";
import { refreshAccessToken, handleAdminLogout } from 'common/Common';
import { useSelector } from "react-redux";
import Loading from 'common/Loading';
import "manager/carinfo/CarInfo.css";

const RentalCarInfo = ({ onClick }) => {
  const isLoginState = useSelector((state) => state.adminState.loginState);

  const [vehicles, setVehicles] = useState([])
  const [vehiclesTrigger, setVehiclesTrigger] = useState(false);

  const [isPopUp, setIsPopUp] = useState(false);
  const [isDetailPopUp, setIsDetailPopUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [workMode, setWorkMode] = useState("");
  const [searchName, setSearchName] = useState("");

  const pageSize = 15;
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [carMenuOptions, setCarMenuOptions] = useState([]);
  const [branchMenuOptions, setBranchMenuOptions] = useState([]);

  const [availableRentalCarsCount, setAvailableRentalCarsCount] = useState(0);
  const [rentedRentalCarsCount, setRentedRentalCarsCount] = useState(0);
  const [maintenanceRentalCarsCount, setMaintenanceRentalCarsCount] = useState(0);

  const [isHandleDetailRentalCarsSearchClick, setIsHandleDetailRentalCarsSearchClick] = useState(false); // 상세검색 SELECT, COUNT 조건에 활용
  const [isSearchClicked, setIsSearchClicked] = useState(false); // 플래그 상태 추가
  const [isAlertShown, setIsAlertShown] = useState(false);
  
  const [columnDefs] = useState([
    { headerName: '코드', field: 'car_code', width: 75, align: 'center' },
    { headerName: '차종명', field: 'car_type_name', width: 150, align: 'center' },
    { headerName: '차량번호', field: 'car_number', width: 150, align: 'center' },
    { headerName: '차량상태', field: 'car_status', width: 75, align: 'center' },
    { headerName: '지점명', field: 'branch_name', width: 75, align: 'center' },
    { headerName: '차종구분', field: 'car_type_category', width: 75, align: 'center' },
    { headerName: '국산/수입', field: 'origin_type', width: 75, align: 'center' },
    { headerName: '인승', field: 'seating_capacity', width: 75, align: 'center' },
    { headerName: '연료', field: 'fuel_type', width: 75, align: 'center' },
    { headerName: '제조사', field: 'car_manufacturer', width: 75, align: 'center' },
    { headerName: '년식', field: 'model_year', width: 75, align: 'center' },
    { headerName: '작업', field: '', width: 200, align: 'center' },
  ]);

  const [carCode, setCarCode] = useState("");
  const [carTypeCode, setCarTypeCode] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [modelYear, setModelYear] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [carStatus, setCarStatus] = useState("");

  const [carTypeName, setCarTypeName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [carTypeCategory, setCarTypeCategory] = useState("");
  const [originType, setOriginType] = useState("");
  const [seatingCapacity, setSeatingCapacity] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [carManufacturer, setCarManufacturer] = useState("");

  const optionsMenuCarStatus = [
    { value: '01', label: '렌탈가능' },
    { value: '02', label: '렌탈중' },
    { value: '03', label: '정비중' },
  ];

  const optionsMenuCarTypeCategory = [
    { value: '01', label: '경형/소형' },
    { value: '02', label: '중형/대형' },
    { value: '03', label: 'SUV' },
    { value: '04', label: '승합' },
  ];

  const optionsMenuOriginType = [
    { value: '01', label: '국산'},
    { value: '02', label: '수입'},
  ]

  const optionsMenuSeatingCapacity = [
    { value: '01', label: '4인승' },
    { value: '02', label: '5인승' },
    { value: '03', label: '6인승' },
    { value: '04', label: '7인승' },
    { value: '01', label: '8인승' },
    { value: '02', label: '9인승' },
    { value: '03', label: '10인승' },
    { value: '04', label: '11인승' },
    { value: '01', label: '12인승' },
    { value: '02', label: '15인승' },
  ];

  const optionsMenuFuelType = [
    { value: '01', label: '가솔린' },
    { value: '02', label: '디젤' },
    { value: '03', label: 'LPG' },
    { value: '04', label: '전기차' },
    { value: '05', label: '하이브리드' },
  ];

  const optionsMenuCarManufacturer = [
    { value: '01', label: '기아자동차' },
    { value: '02', label: '현대자동차' },
    { value: '03', label: '제네시스' },
    { value: '04', label: '르노코리아' },
    { value: '05', label: 'KG모빌리티' },
    { value: '06', label: '쉐보레' },
    { value: '07', label: '테슬라' },
    { value: '08', label: '벤츠' },
    { value: '09', label: 'BMW' },
    { value: '10', label: 'Jeep' },
    { value: '11', label: 'MINI' },
    { value: '12', label: '아우디' },
    { value: '13', label: '포르쉐' },
    { value: '14', label: '폭스바겐' },
    { value: '15', label: '폴스타' },
  ];

  useEffect(() => {
    if (!isLoginState) {
      alert("로그인이 필요합니다.");
      return;
    }

    handleSearchVehiclesWithPagingClick();
    getTotalCount();
 
    getAvailabelRentalCarsCount("01");
    getRentedRentalCarsCount("02");
    getMaintenanceRentalCarsCount("03");
  }, [pageNumber, vehiclesTrigger]);

  useEffect(() => {
    if (!isLoginState) {
      alert("로그인이 필요합니다.");
      return;
    }

    const fetchCarMenus = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        await getCarMenuOptions(token);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          try {
            const newToken = await refreshAccessToken();
            await getCarMenuOptions(newToken);
          } catch (refreshError) {
            alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
            handleAdminLogout();
          }
        } else {
          console.error('There was an error fetching the carMenu!', error);
        }
      }
    };

    const fetchBranchMenus = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        await getBranchMenuOptions(token);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          try {
            const newToken = await refreshAccessToken();
            await getBranchMenuOptions(newToken);
          } catch (refreshError) {
            alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
            handleAdminLogout();
          }
        } else {
          console.error('There was an error fetching the branchMenu!', error);
        }
      }
    };

    fetchCarMenus();
    fetchBranchMenus();
  }, []);

  const getCarMenuOptions = async (token) => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/rentalcars/car/option`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true, 
    });
    setCarMenuOptions(response.data);
  };

  const getBranchMenuOptions = async (token) => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/rentalcars/branch/option`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true, 
    });
    setBranchMenuOptions(response.data);
  };

   const handleSearchVehiclesWithPagingClick = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (isHandleDetailRentalCarsSearchClick) {
        await getDetailVehicles(token);
        if (!isSearchClicked) { // 검색 클릭시 플래그 상태가 fasle면 1페이지로 이동
          if (pageNumber === 1) {
            setVehiclesTrigger((prev) => !prev);
          } else {
            setPageNumber(1);
          }
          setIsSearchClicked(true); // 1페이지로 이동 후 플래그 상태 true로 변경(페이지 변경 시 계속 1페이지에 머무는 현상 방지)
          setIsDetailPopUp(false);
        }
      } else {
        await getVehicles(token);
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        try {
          const newToken = await refreshAccessToken();
          if (isHandleDetailRentalCarsSearchClick) {
            await getDetailVehicles(newToken);
            if (!isSearchClicked) { // 검색 클릭시 플래그 상태가 fasle면 1페이지로 이동
              if (pageNumber === 1) {
                setVehiclesTrigger((prev) => !prev);
              } else {
                setPageNumber(1);
              }
              setIsSearchClicked(true); // 1페이지로 이동 후 플래그 상태 true로 변경(페이지 변경 시 계속 1페이지에 머무는 현상 방지)
              setIsDetailPopUp(false);
            }
          } else {
            await getVehicles(newToken);
          }
        } catch (error) {
          alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
          handleAdminLogout();
        }
      } else {
        console.error('There was an error fetching the vehicles pageing!', error);
      }
    }
  };

  const getVehicles = async (token) => {
    const params = {
      pageSize,
      pageNumber,
    };

    if (searchName && searchName.trim() !== "") {
      // searchName이 설정된 경우
      params.carNumber = searchName;
    }

    const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/rentalcars/paged`, 
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      });

      if (response.data && response.data.length > 0) {  // 배열인 경우
        setVehicles(response.data);
      } else if (response.data && Object.keys(response.data).length > 0) {  // 객체인 경우
        setVehicles(response.data);
      } else {
        alert("조건에 맞는 차량번호가 없습니다.");
        setVehicles(response.data);
      }
  };

  const getDetailVehicles = async (token) => {
    // alert 플래그 초기화
    setIsAlertShown(false);

    const params = {
      pageSize,
      pageNumber,
    };

    // 필터 조건들
    const filters = {
      carTypeName: carTypeName?.trim(),
      carStatus: carStatus?.trim(),
      branchName: branchName?.trim(),
      originType: originType?.trim(),
      carTypeCategory: carTypeCategory?.trim(),
      seatingCapacity: seatingCapacity?.trim(),
      fuelType: fuelType?.trim(),
      carManufacturer: carManufacturer?.trim(),
      modelYear: modelYear?.trim(),
    };

    // 조건에 따라 `params`에 추가
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params[key] = filters[key];
      }
    })

    const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/rentalcars/paged`, 
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      });

    // 검색 결과가 없고 아직 alert가 표시되지 않았을 때만 alert 표시
    if (!response.data || response.data.length === 0) {
      if (!isAlertShown) {
        alert("조건에 맞는 차량이 없습니다.");
        setIsAlertShown(true);
      }
    }

    setVehicles(response.data);
   };

  const getTotalCount = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (isHandleDetailRentalCarsSearchClick) {
        await getSearchCount(token)
      } else {
        await getCount(token);
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        try {
          const newToken = await refreshAccessToken();
          if (isHandleDetailRentalCarsSearchClick) {
            await getSearchCount(newToken);
          } else {
            await getCount(newToken);
          }
        } catch (error) {
          alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
          handleAdminLogout();
        }
      } else {
        console.error('There was an error fetching the vehicles count!', error);
      }
    }
  };

  const getCount = async (token) => {
    const params = searchName ? { carNumber: searchName } : {};

    const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/rentalcars/count`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      });

    if (typeof response.data === 'number') {
      setTotalCount(response.data);
    } else {
      console.error('Unexpected response:', response.data);
    }
  };

  const getSearchCount = async (token) => {
    const params = {};

    // 필터 조건들
    const filters = {
      carTypeName: carTypeName?.trim(),
      carStatus: carStatus?.trim(),
      branchName: branchName?.trim(),
      originType: originType?.trim(),
      carTypeCategory: carTypeCategory?.trim(),
      seatingCapacity: seatingCapacity?.trim(),
      fuelType: fuelType?.trim(),
      carManufacturer: carManufacturer?.trim(),
      modelYear: modelYear?.trim(),
    };
    
    // 조건에 따라 `params`에 추가
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params[key] = filters[key];
      }
    })

    const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/rentalcars/count`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      });

    if (typeof response.data === 'number') {
      setTotalCount(response.data);
    } else {
      console.error('Unexpected response:', response.data);
    }
  };

  const getAvailabelRentalCarsCount = async (carStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      await getAvailableRentalCarsByStatus(token, carStatus);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        try {
          const newToken = await refreshAccessToken();
          await getAvailableRentalCarsByStatus(newToken, carStatus);
        } catch (error) {
          alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
          handleAdminLogout();
        }
      } else {
        console.error('There was an error fetching the vehicles pageing!', error);
      }
    }
  };

  const getAvailableRentalCarsByStatus = async (token, carStatus) => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/rentalcars/count/${carStatus}`, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      });

    if (response.data) {
      setAvailableRentalCarsCount(response.data);
    }
  };

  const getRentedRentalCarsCount = async (carStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      await getRentedRentalCarsByStatus(token, carStatus);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        try {
          const newToken = await refreshAccessToken();
          await getRentedRentalCarsByStatus(newToken, carStatus);
        } catch (error) {
          alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
          handleAdminLogout();
        }
      } else {
        console.error('There was an error fetching the vehicles pageing!', error);
      }
    }
  };

  const getRentedRentalCarsByStatus = async (token, carStatus) => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/rentalcars/count/${carStatus}`, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      });

    if (response.data) {
      setRentedRentalCarsCount(response.data);
    }
  };

  const getMaintenanceRentalCarsCount = async (carStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      await getMaintenanceRentalCarsCountByStatus(token, carStatus);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        try {
          const newToken = await refreshAccessToken();
          await getMaintenanceRentalCarsCountByStatus(newToken, carStatus);
        } catch (error) {
          alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
          handleAdminLogout();
        }
      } else {
        console.error('There was an error fetching the vehicles pageing!', error);
      }
    }
  };

  const getMaintenanceRentalCarsCountByStatus = async (token, carStatus) => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/rentalcars/count/${carStatus}`, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      });

    if (response.data) {
      setMaintenanceRentalCarsCount(response.data);
    }
  };

  const handleUpdateClick = (updateData, workMode) => {
    setIsPopUp(true);
    setWorkMode(workMode);
    setCarCode(updateData.car_code);
    setCarTypeCode(updateData.car_type_code); // carTypeName으로 가져온(GET) 데이터를 다시 carTypeCode로 서버에 보내기위해 DB에서 전달(GET) 받은 데이터 이용
    setCarNumber(updateData.car_number);
    setModelYear(updateData.model_year)
    setBranchCode(updateData.branch_code); // branchName으로 가져온(GET) 데이터를 다시 branchCode로 서버에 보내기위해 DB에서 전달(GET) 받은 데이터 이용
    setCarStatus(updateData.car_status_code); // String타입으로 가져온(GET) 데이터를 다시 Char(2)타입으로 서버에 보내기위해 DB에서 전달(GET) 받은 code 이용
  };

  const viewDataInit = () => {
    setCarCode("");
    setCarTypeCode("05");
    setCarNumber("")
    setModelYear("");
    setBranchCode("01");
    setCarStatus("01");
  };

  const viewDetailDataInit = () => {
    setCarTypeName("");
    setCarStatus("");
    setBranchName("");
    setCarTypeCategory("");
    setOriginType("");
    setSeatingCapacity("");
    setFuelType("");
    setCarManufacturer("");
    setModelYear("");
  }

  const handleSearchClick = async () => {
    setIsHandleDetailRentalCarsSearchClick(false); // 상세검색 SELECT, COUNT 조건에 활용(false면 일반)
    if (pageNumber === 1) {
      setVehiclesTrigger((prev) => !prev);
    } else {
      setPageNumber(1);
    }
  };

   const handleDetailSearchClick = async (workMode) => {
    setIsHandleDetailRentalCarsSearchClick(true); // 상세검색 SELECT, COUNT 조건에 활용(true면 상세검색)
    setIsDetailPopUp(true);
    setWorkMode(workMode);
    setIsSearchClicked(false); // 상세검색 버튼 클릭시 플래그 상태 false로 초기화(시작은 무조건 false, 상태가 false여야 검색시 1페이지로 이동)
    viewDetailDataInit();
   }

  const handleInsertClick = (workMode) => {
    setIsHandleDetailRentalCarsSearchClick(false); // 상세검색 내역이 없는 상태에서 차량을 등록할 때 alert 호출되는 현상 막기 위해 적용 
    setIsPopUp(true);
    setWorkMode(workMode);
    viewDataInit();
  };

  const handleDeleteClick = async (carCode) => {
    if (window.confirm('차량을 정말로 삭제하시겠습니까?')) {
      try {
        const token = localStorage.getItem('accessToken');
        await deleteVehicle(token, carCode);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          try {
            const newToken = await refreshAccessToken();
            await deleteVehicle(newToken, carCode);
          } catch (error) {
            alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
            handleAdminLogout();
          }
        } else {
          alert("삭제 중 오류가 발생했습니다." + error);
        }
      }
    }
  };

  const deleteVehicle = async (token, carCode) => {
    await axios.delete(`${process.env.REACT_APP_API_URL}/arentcar/manager/rentalcars/${carCode}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true,
    });
    setVehicles((prevVehicle) => prevVehicle.filter(vehicle => vehicle.car_code !== carCode));
    setVehiclesTrigger((prev) => !prev);
    alert("차량이 삭제되었습니다.");
  };

  const handleFinishMaintenanceRentalCarsClick = async (carCode, carStatus) => {
    if (carStatus == "렌탈가능" || carStatus == "렌탈중") {
      alert("반납된/정비중인 차량이 아닙니다");
    } else {
      if (window.confirm('차량 정비를 완료했습니까?')) {
        try {
          const token = localStorage.getItem('accessToken');
          await updateRentalCarsStatus(token, carCode);
        } catch (error) {
          if (error.response && error.response.status === 403) {
            try {
              const newToken = await refreshAccessToken();
              await updateRentalCarsStatus(newToken, carCode);
            } catch (error) {
              alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
              handleAdminLogout();
            }
          } else {
            alert("차량 정비 중 오류가 발생했습니다." + error);
          }
        }
      }
    }
  };

  const updateRentalCarsStatus = async (token, carCode) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/arentcar/manager/rentalcars/status/${carCode}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setVehicles((prevVehicle) => prevVehicle); // 차량 상태 갱신
      setVehiclesTrigger((prev) => !prev);
      alert("차량 정비를 완료했습니다.");
      return response.data;
    } catch (error) {
      throw new Error("차량 상태 갱신 중 오류 발생: " + error.message);
    }
  };

  const handleDataSaveClick = async () => {
    if (!validateCheck()) {
      return; 
    }

    const newVehicle = {
      car_code: carCode,
      car_type_code: carTypeCode,
      car_number: carNumber,
      model_year: modelYear,
      branch_code: branchCode,
      car_status: carStatus,
    };

    if (workMode === "수정") {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        await updateVehicle(token, newVehicle);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          try {
            const newToken = await refreshAccessToken();
            await updateVehicle(newToken, newVehicle);
          } catch (error) {
            alert("인증이 만료되었습니다. 다시 로그인 해주세요." + error);
            handleAdminLogout();
          }
        } else {
          alert("차량 수정 중 오류가 발생했습니다." + error);
        }
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        await createVehicle(token, newVehicle);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          try {
            const newToken = await refreshAccessToken();
            await createVehicle(newToken, newVehicle);
          } catch (error) {
            alert("인증이 만료되었습니다. 다시 로그인 해주세요." + error);
            handleAdminLogout();
          }
        } else {
          alert("차량 등록 중 오류가 발생했습니다." + error);
        }
      } finally {
        setLoading(false);
      }
    }

    setIsPopUp(false);
  };

  const updateVehicle = async (token, newVehicle) => {
    await axios.put(
      `${process.env.REACT_APP_API_URL}/arentcar/manager/rentalcars/${carCode}`,
      newVehicle,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    setVehicles((prevVehicle) => prevVehicle.map(vehicle => vehicle.car_code === carCode ? newVehicle : vehicle));
    setVehiclesTrigger((prev) => !prev);
    alert("차량이 수정되었습니다.");
  };
  
  const createVehicle = async (token, newVehicle) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/arentcar/manager/rentalcars`, 
        newVehicle, // Spring Boot에서 @RequestBody로 받는 객체 데이터
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true,
        });
  
      const savedVehicle = response.data;
      newVehicle.car_code = response.data.car_code;
      newVehicle.car_password = response.data.car_password;
      setVehicles((prevVehicle) => [...prevVehicle, savedVehicle]);
      setVehiclesTrigger((prev) => !prev);
      alert("차량이 등록되었습니다.");
    } catch (error) {
      console.error(error); // 디버그용 로그
      if (error.response && error.response.status === 409) {
        alert(error.response.data.message); // "이미 등록된 차량 번호입니다." 메시지 출력
      } else {
        alert("차량 등록 중 오류가 발생했습니다." + error);
      }
    }
  };

  const handlePopupCloseClick = () => {
    setIsHandleDetailRentalCarsSearchClick(false); // 상세검색 SELECT, COUNT 조건에 활용(false면 일반)
    setIsPopUp(false);
    setIsDetailPopUp(false);
  };

  const handleCloseClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const validateCheck = () => {
    if(isHandleDetailRentalCarsSearchClick) {
      if (isNaN(modelYear) || modelYear.length < 1 || modelYear.length > 4) {
        alert("년식은 1~4자리 숫자만 입력 가능합니다.");
        return false;
      }
      return true; 
    } else {
      if (!carTypeCode || carTypeCode.trim() === '') {
        alert("차종명을 선택해주세요.");
        return false;
      };
      if (!carNumber || carNumber.trim() === '') {
        alert("차량번호를 입력해주세요.");
        return false;
      };
      if (!modelYear || modelYear.trim() === '') {
        alert("년식을 입력해주세요.");
        return false;
      }
      if (isNaN(modelYear) || modelYear.length < 1 || modelYear.length > 4) {
        alert("년식은 1~4자리 숫자만 입력 가능합니다.");
        return false;
      }
      return true; 
    }
  };

  const totalWidth = columnDefs.reduce((sum, columnDef) => {
    return sum + (columnDef.width ? columnDef.width : 150);
  }, 0);

  const handlePageChange = (newPageNumber) => {
    setPageNumber(newPageNumber);
  };

  // 엑셀 파일 다운로드
  const handleDownloadExcel = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      await getRentalCarsExcel(token);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        try {
          const newToken = await refreshAccessToken();
          await getRentalCarsExcel(newToken);
        } catch (error) {
          alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
          handleAdminLogout();
        }
      } else {
        console.error('There was an error fetching the rental cars excel!', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const getRentalCarsExcel = async (token) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/rentalcars/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: 'blob', // 서버에서 파일을 blob 형태로 받기 위해 설정
          withCredentials: true,
        });

      // 파일 다운로드를 위한 URL 생성
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'rentalcars.xlsx'); // 다운로드할 파일 이름 설정, download속성은 링크로 연결되지 않고 대신 해당 콘텐츠가 다운로드됨을 명시함
      document.body.appendChild(link);
      link.click(); // 링크를 클릭하여 파일 다운로드를 시작한다
      link.remove(); // 다운로드 후 <a>태그를 DOM에서 제거한다
      alert("엑셀파일 다운로드를 완료했습니다")  
    } catch (error) {
      console.error('Error downloading the Excel file', error);
    }
  };

  let totalPages = Math.ceil(totalCount / pageSize);
  if (totalPages < 1) {
    totalPages = 1;
  }

  return (
    <div className="car-info-wrap">
      <div className="car-info-header-wrap">
        <div className="car-info-title-wrap flex-align-center">
          <div className="manager-title">● 차량관리</div>
          <div className="car-info-status-wrap flex-align-center">
            <div className="car-info-status-display car-info-status-display-main">전체차량<div className="car-info-status-content car-info-status-content-main">{totalCount}</div></div>
            <div className="car-info-status-display">대여가능<div className="car-info-status-content">{availableRentalCarsCount}</div></div>
            <div className="car-info-status-display">대여중<div className="car-info-status-content">{rentedRentalCarsCount}</div></div>
            <div className="car-info-status-display">정비중<div className="car-info-status-content">{maintenanceRentalCarsCount}</div></div>
            <div className="car-info-status-display car-info-status-button-wrap">
              <div className="car-info-status-excel-wrap">
                <button className="car-info-status-button" onClick={handleDownloadExcel}>
                 <img className="car-info-excel-download" src={`${process.env.REACT_APP_IMAGE_URL}/excel-logo.png`} alt="rentalCars excel downlod button" />
               </button>
              </div>
            </div>
          </div> 
        </div>
        <div
          className='car-info-button-wrap'
          style={{ width: `${totalWidth}px` }}
        >
          <div className='flex-align-center'>
            <label className='manager-label' htmlFor="">차량번호</label>
            <input className='width200' type="text" value={searchName} onChange={(e) => (setSearchName(e.target.value))}/>
            <button className='manager-button manager-button-search' onClick={() => handleSearchClick()}>검색</button>
            <button className='manager-button manager-button-search' onClick={() => handleDetailSearchClick("검색")}>상세검색</button>
            <span>[검색건수 : {totalCount}건]</span>
          </div>
          <div>
            <button className='manager-button manager-button-insert' onClick={() => handleInsertClick("등록")}>추가</button>
            <button className='manager-button manager-button-close' onClick={() => handleCloseClick()}>닫기</button>
          </div>
        </div>
      </div>

      <div className="car-info-content-wrap">
        <div className="car-info-content-header">
          {columnDefs.map((title, index) => (
           <div key={index} className='manager-head-column' style={{ width: `${title.width}px`, textAlign: `center` }}>{title.headerName}</div>
          ))}
        </div>
        <div className="car-info-content-row-wrap">
          {vehicles.map((row, index) => (
            <div key={index} className='register-menu-content-row'>
              {columnDefs.map((title, index) => ( // vehicles.map 안에 columnDefs.map이 있는 이유는 각 차량(row)의 정보를 열(title)에 맞춰 표시하기 위함
                                                  // 즉, 각 차량(row)에 대해 모든 열을(title) 반복하여 해당 차량의 각 필드 값(titile.field)을 표시함
                <div
                  key={index} className='manager-row-column'
                  style={{
                    ...(title.field === '' ? { display: 'flex' } : ''),
                    ...(title.field === '' ? { alignItems: 'center' } : ''),
                    ...(title.field === '' ? { justifyContent: 'center' } : ''),
                    width: `${title.width}px`,
                    textAlign: `${title.align}`
                  }}
                >
                  {title.field === '' ? (
                    <>
                      <button className='manager-button manager-button-update' onClick={() => handleUpdateClick(row, "수정")}>수정</button>
                      <button className='manager-button manager-button-delete' onClick={() => handleDeleteClick(row.car_code)}>삭제</button>
                      <button className='manager-button' onClick={() => handleFinishMaintenanceRentalCarsClick(row.car_code, row.car_status)}>정비완료</button>
                    </>
                  ) : (
                      row[title.field]
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {isPopUp &&
          <div className='manager-popup'>
            <div className='car-info-content-popup-wrap'>
              <div className='car-info-content-popup-close'>
                <div className='manager-popup-title'>● 차량{workMode}</div>
                <div className='car-info-content-popup-button'>
                  <button className='manager-button manager-button-save' onClick={handleDataSaveClick}>저장</button>
                  <button className='manager-button manager-button-close' onClick={handlePopupCloseClick}>닫기</button>
                </div>
              </div>
              <div className='car-info-content-popup-line'>
                <label className='width80 word-right label-margin-right' htmlFor="carCode">차량코드</label>
                <input className='width50  word-center' id="carCode" type="text" value={carCode} disabled />
              </div>
              <div className='car-info-content-popup-line'>
                <label className='width80 word-right label-margin-right' htmlFor="carTypeCode">차종명</label>
                <select className='width120' id="carTypeCode" value={carTypeCode} onChange={(e) => (setCarTypeCode(e.target.value))}>
                  {carMenuOptions.map((option) => (
                    <option key={option.car_type_code} value={option.car_type_code}>
                      {option.car_type_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className='car-info-content-popup-line'>
                <label className='width80 word-right label-margin-right' htmlFor="carNumber">차량번호</label>
                <input className='width120  word-center' id="carNumber" type="text" placeholder="예) 01가1001" maxLength={12} value={carNumber} onChange={(e) => {setCarNumber(e.target.value)}} />
              </div>
              <div className='car-info-content-popup-line'>
                <label className='width80 word-right label-margin-right' htmlFor="modelYear">년식</label>
                <input className='width120  word-center' id="modelYear" type="text" placeholder="예) 2024" maxLength={4} value={modelYear} onChange={(e) => {setModelYear(e.target.value)}} />
              </div>
              <div className='car-info-content-popup-line'>
                <label className='width80 word-right label-margin-right' htmlFor="branchCode">지점명</label>
                <select className='width120' id="branchCode" value={branchName} onChange={(e) => (setBranchName(e.target.value))}>
                  {branchMenuOptions.map((option) => (
                    <option key={option.branch_code} value={option.branch_code}>
                      {option.branch_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className='car-info-content-popup-line'>
                <label className='width80 word-right label-margin-right' htmlFor="carStatus">차량상태</label>
                <select className='width120' id="carStatus" value={carStatus} onChange={(e) => (setCarStatus(e.target.value))}>
                  {optionsMenuCarStatus.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        }

        {isDetailPopUp &&
          <div className="manager-popup">
            <div className="car-info-content-popup-wrap">
              <div className='car-info-content-popup-close'>
                <div className='manager-popup-title'>● 차량{workMode}</div>
                <div className='car-info-content-popup-button'>
                  <button className='manager-button manager-button-save' onClick={handleSearchVehiclesWithPagingClick}>검색</button>
                  <button className='manager-button manager-button-close' onClick={handlePopupCloseClick}>닫기</button>
                </div>
              </div>
              <div className='car-info-content-popup-line'>
                <label className='width80 word-right label-margin-right' htmlFor="carTypeName">차종명</label>
                <select className='width120' id="carTypeName" value={carTypeName} onChange={(e) => (setCarTypeName(e.target.value))}>
                  <option value="" disabled>선택해주세요</option>
                  {carMenuOptions.map((option) => (
                    <option key={option.car_type_code} value={option.car_type_name}>
                      {option.car_type_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className='car-info-content-popup-line'>
                <label className='width80 word-right label-margin-right' htmlFor="carStatus">차량상태</label>
                <select className='width120' id="carStatus" value={carStatus} onChange={(e) => (setCarStatus(e.target.value))}>
                  <option value="" disabled>선택해주세요</option>
                  {optionsMenuCarStatus.map((option) => (
                    <option key={option.value} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className='car-info-content-popup-line'>
                <label className='width80 word-right label-margin-right' htmlFor="branchName">지점명</label>
                <select className='width120' id="branchName" value={branchName} onChange={(e) => (setBranchName(e.target.value))}>
                  <option value="" disabled>선택해주세요</option>
                  {branchMenuOptions.map((option) => (
                    <option key={option.branch_code} value={option.branch_name}>
                      {option.branch_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className='car-info-content-popup-line'>
                <label className='width80 word-right label-margin-right' htmlFor="carTypeCategory">차종구분</label>
                <select className='width120' id="carTypeCategory" value={carTypeCategory} onChange={(e) => (setCarTypeCategory(e.target.value))}>
                  <option value="" disabled>선택해주세요</option>
                  {optionsMenuCarTypeCategory.map((option) => (
                    <option key={option.value} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className='car-info-content-popup-line'>
                <label className='width80 word-right label-margin-right' htmlFor="originType">국산/수입</label>
                <select className='width120' id="originType" value={originType} onChange={(e) => (setOriginType(e.target.value))}>
                  <option option value="" disabled>선택해주세요</option>
                  {optionsMenuOriginType.map((option) => (
                    <option key={option.value} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className='car-info-content-popup-line'>
                <label className='width80 word-right label-margin-right' htmlFor="seatingCapacity">수용인원</label>
                <select className='width120' id="seatingCapacity" value={seatingCapacity} onChange={(e) => (setSeatingCapacity(e.target.value))}>
                  <option value="" disabled>선택해주세요</option>
                  {optionsMenuSeatingCapacity.map((option) => (
                    <option key={option.value} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className='car-info-content-popup-line'>
                <label className='width80 word-right label-margin-right' htmlFor="fuelType">연료</label>
                <select className='width120' id="fuelType" value={fuelType} onChange={(e) => (setFuelType(e.target.value))}>
                  <option value="" disabled>선택해주세요</option>
                  {optionsMenuFuelType.map((option) => (
                    <option key={option.value} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className='car-info-content-popup-line'>
                <label className='width80 word-right label-margin-right' htmlFor="carManufacturer">제조사</label>
                <select className='width120' id="carManufacturer" value={carManufacturer} onChange={(e) => (setCarManufacturer(e.target.value))}>
                  <option value="" disabled>선택해주세요</option>
                  {optionsMenuCarManufacturer.map((option) => (
                    <option key={option.value} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className='car-info-content-popup-line'>
                <label className='width80 word-right label-margin-right' htmlFor="modelYear">년식</label>
                <input className='width120  word-center' id="modelYear" type="text" placeholder="예) 2024" maxLength={4} value={modelYear} onChange={(e) => {setModelYear(e.target.value)}} />
              </div>
            </div>
          </div>
        }
      </div>

      <div className='car-info-pageing-wrap flex-align-center'>
        <button className="manager-button" onClick={() => handlePageChange(1)}>처음</button>
        <button 
          className='manager-button'
          style={{color: pageNumber === 1 ?  '#aaa' : 'rgb(38, 49, 155)'}} 
          onClick={() => handlePageChange(pageNumber - 1)} 
          disabled={pageNumber === 1}
        >이전</button>
        <div className='car-info-pageing-display'>{pageNumber} / {totalPages}</div>
        <button 
          className='manager-button' 
          style={{color: pageNumber === totalPages ?  '#aaa' : 'rgb(38, 49, 155)'}} 
          onClick={() => handlePageChange(pageNumber + 1)} 
          disabled={pageNumber === totalPages}
        >다음</button>
        <button className="manager-button" onClick={() => handlePageChange(totalPages)}>마지막</button>
      </div>

      {loading && (<Loading />)}

    </div>
    );
  };

export default RentalCarInfo;
