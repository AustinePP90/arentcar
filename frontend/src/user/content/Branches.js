import React, { useState, useEffect, useRef} from "react";
import axios from "axios";
import Loading from 'common/Loading';
import "user/content/Branches.css";


const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [branchName, setBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchPostCode, setBranchPostCode] = useState("");
  const [branchPhone, setBranchPhone] = useState("");
  const [branchPickup, setBranchPickup] = useState("");
  const [branchReturn, setBranchReturn] = useState("");
  const [loading, setLoading] = useState(false);

  const mapElement = useRef(null); // DOM 요소나 변수처럼 컴포넌트가 재렌더링되더라도 유지되어야 하는 값을 관리할 때 사용함
                                   // useRef가 반환하는 객체는 {current: null}로 초기화 -> 컴포넌트가 렌더링되고 나서 DOM 요소가 연결(ref)되면, current가 그 요소를 참조함
                                   // ref={mapElement}를 통해 해당 DOM 요소(<div></div>)가 mapElement.current에 저장된다, useRef로 생성된 객체에는 current라는 속성이 있어 이를 통해 값을 저장하거나 참조할 수 있다

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/user/branchs`);
        if (response.data) {
          setBranches(response.data);
        }
      } catch (error) {
        console.error("There was an error fetching the branches", error);
      }
    };

    fetchBranches();
  }, []);

  const handleBranchGuideClick = async (branch) => {
    setBranchName(branch.branch_name);
    setBranchAddress(branch.branch_detailed_address);
    setBranchPostCode(branch.post_code);
    setBranchPhone(branch.branch_phone_number);
    setBranchPickup(branch.available_pickup_time);
    setBranchReturn(branch.available_return_time);
  
    const clientId = process.env.REACT_APP_NAVER_MAP_CLIENT_ID; // .env에서 가져오기
    if (!clientId) {
      console.error("Naver Map Client ID is not defined in .env file");
      return;
    }
  
    try {
      setLoading(true);
      await loadNaverMapScript(clientId); // 스크립트 로드 완료 대기
      await initializeMap(branch.branch_longitude, branch.branch_latitude); // 지도 초기화
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const loadNaverMapScript = (clientId) => {
    // Promise는 비동기 작업이 성공하거나 실패할 때 특정 동작을 정의하는 객체임
    // resolve - Promise를 성공 상태로 변경하고 결과값을 전달, reject - Promise를 실패 상태로 변경하고 오류 메시지를 전달
    return new Promise((resolve, reject) => {
      if (window.naver && window.naver.maps) {
        resolve(); // 이미 로드된 경우 바로 resolve
      } else {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
        script.async = true;
  
        script.onload = () => resolve(); // 스크립트 로드 완료 시 resolve
        script.onerror = () => reject(new Error("Failed to load Naver Map script"));
        document.head.appendChild(script);
      }
    });
  };
  
  const initializeMap = async (lng, lat) => {
    if (!lng || !lat) {
      console.error("Longitude or Latitude is missing.");
      return;
    }

    if (mapElement.current) {
      const mapOptions = {
        center: new window.naver.maps.LatLng(lat, lng),
        zoom: 15,
      };
      const map = new window.naver.maps.Map(mapElement.current, mapOptions);
      new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(lat, lng),
        map: map,
      });
    } else {
      console.error("Map element is invalid.");
    }
  };

  return (
    <div className="branches-guide-wrap flex-align-center">
      <div className="branches-guide-menu-wrap">
        {branches.map((branch, index) => (
            <div className="branches-guide-menu-item" key={index} onClick={() => handleBranchGuideClick(branch)}>
            {branch.branch_name}
            </div>
        ))}
      </div>
      <div className="branches-guide-content-wrap">
        <div className="branches-guide-map-wrap" ref={mapElement}>지점을 선택해주세요.</div> {/* ref={mapElement}를 통해 해당 DOM 요소(<div></div>)가 mapElement.current에 저장된다 */} 
        {branchName && (
        <div className="branches-guide-info-wrap">
         <div className="info-row">
          <strong>지점이름 : </strong>
          <span>{branchName}</span>
         </div>
         <div className="info-row">
           <strong>주&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;소 : </strong>
           <span>{branchAddress}</span>
         </div>
         <div className="info-row">
           <strong>우편번호 : </strong>
           <span>{branchPostCode}</span>
         </div>
         <div className="info-row">
           <strong>전화번호 : </strong>
           <span>{branchPhone}</span>
         </div>
         <div className="info-row">
           <strong>이용시간 : </strong>
           <span>{branchPickup} ~ {branchReturn}</span>
        </div>
      </div>
        )}
      </div>

      {loading && (<Loading />)}

    </div>
  );
};

export default Branches;
