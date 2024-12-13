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
    if (!process.env.REACT_APP_API_URL) {
      console.error("API URL is not defined in .env file");
      alert("API URL이 설정되지 않았습니다.");
    }

    const fetchBranches = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/user/branchs`);
        if (Array.isArray(response.data) && response.data.length > 0) {
          setBranches(response.data);
        } else {
          console.warn("No branches found.");
          alert("등록된 지점이 없습니다.");
          setBranches([]);
        }
      } catch (error) {
        console.error("There was an error fetching the branches", error);
        alert("지점 정보를 불러오는 데 실패했습니다. 다시 시도해주세요.");
      }
    };

    fetchBranches();
  }, []);

  const handleBranchGuideClick = async (branch) => {
    if (loading) return; // 이미 로딩 중인 경우 중복 실행 방지

    if (!branch || !branch.branch_longitude || !branch.branch_latitude) {
      console.error("Invalid branch data. Longitude or Latitude is missing.");
      alert("지점 데이터가 올바르지 않습니다.");
      return;
    }

    setBranchName(branch.branch_name || "정보 없음");
    setBranchAddress(branch.branch_detailed_address || "정보 없음");
    setBranchPostCode(branch.post_code || "정보 없음");
    setBranchPhone(branch.branch_phone_number || "정보 없음");
    setBranchPickup(branch.available_pickup_time || "정보 없음");
    setBranchReturn(branch.available_return_time || "정보 없음");
  
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
        script.onerror = () => {
          console.error("Failed to load Naver Map script");
          alert("지도 로드에 실패했습니다. 인터넷 연결을 확인하세요.");
          reject(new Error("Failed to load Naver Map script"));
        };
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
        <div className="branches-guide-map-wrap" ref={mapElement}>
          {branchName ? null : "지점을 선택해주세요."}
        </div> {/* ref={mapElement}를 통해 해당 DOM 요소(<div></div>)가 mapElement.current에 저장된다 */} 
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
