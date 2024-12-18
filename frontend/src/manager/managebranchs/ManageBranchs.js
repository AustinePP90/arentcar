import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { refreshAccessToken, handleAdminLogout, formatTime, isValidTimeFormat } from 'common/Common';
import { useSelector } from 'react-redux';
import Loading from 'common/Loading';
import "manager/managebranchs/ManageBranchs.css";

const ManageBranchs = ({ onClick }) => {
    // 로그인하지 않은 사용자가 기능 실행하지 못하도록 관리
    const isLoginState = useSelector((state) => state.adminState.loginState);

    const [branchs, setBranchs] = useState([]); // DB에서 읽어온 지점 데이터
    const [branchsTrigger, setbranchsTrigger] = useState(false); 
    const [isSearched, setIsSearched] = useState(false); // 지점명 검색 여부 상태 추가
    const [isCreatePopUp, setIsCreatePopUp] = useState(false); // 지점 추가 팝업
    const [isUpdatePopup, setIsUpdatePopUp] = useState(false); // 지점 수정 팝업
    const [isDetailPopUp, setIsDetailPopUp] = useState(false); // 지점 상세 팝업
    const [branchDetails, setBranchDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [workMode, setWorkMode] = useState("");
    const [searchName, setSearchName] = useState("");
    const [regionNameMenuOptions, setRegionNameMenuOptions] = useState([]);
    const [totalCount, setTotalCount] = useState(0); // 전체 지점 수
    const [pageNumber, setPageNumber] = useState(1); // 현재 페이지 번호
    const pageSize = 10;

    const [columnDefs] = useState([
        { headerName: '코드', field: 'branch_code', width: 70, align: 'center' },
        { headerName: '지점명', field: 'branch_name', width: 110, align: 'center' },
        { headerName: '지역이름', field: 'region_name', width: 110, align: 'center' },
        { headerName: '기본주소', field: 'branch_basic_address', width: 150, align: 'center' },
        { headerName: '전화번호', field: 'branch_phone_number', width: 150, align: 'center' },
        { headerName: '개점시간', field: 'available_pickup_time', width: 100, align: 'center' },
        { headerName: '폐점시간', field: 'available_return_time', width: 100, align: 'center' },
        { headerName: '상세보기', field: '', width: 180, align: 'center' },
    ]);

    const [branchCode, setBranchCode] = useState("");
    const [branchName, setBranchName] = useState("");
    const [branchLongitude, setBranchLongitude] = useState("");
    const [branchLatitude, setBranchLatitude] = useState("");
    const [regionCode, setRegionCode] = useState("");
    const [regionName, setRegionName] = useState("");
    const [postCode, setPostCode] = useState("");
    const [branchBasicAddress, setBranchBasicAddress] = useState("");
    const [branchDetailedAddress, setBranchDetailedAddress] = useState("");
    const [branchPhoneNumber, setBranchPhoneNumber] = useState("");
    const [availablePickupTime, setAvailablePickupTime] = useState("");
    const [availableReturnTime, setAvailableReturnTime] = useState("");

    useEffect(() => {
        if (!isLoginState) {
            alert("로그인이 필요합니다.");
            return;
        }

        pageingBranchs();
        getTotalCount();
    }, [pageNumber, branchsTrigger]) // pageNumber 변경 시 지점 데이터 페이징, 총 지점 수 함수 호출

    // 지점 데이터 페이징 처리
    const pageingBranchs = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            // 지점 데이터 가져오는 함수 호출 (토큰 필요)
            await getBranchs(token);
        } catch (error) {
            // 403 == 토큰 만료
            if (error.response && error.response.status === 403) {
                try {
                    const newToken = await refreshAccessToken();
                    await getBranchs(newToken);
                } catch (error) {
                    // 새 토큰 요청도 실패하면 인증 만료 알림 및 로그아웃 처리
                    alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
                    handleAdminLogout();
                }
            } else {
                console.error('There was an error fetching the branchs pageing!', error);
            }
        }
    };

    // 지점 데이터 가져오기
    const getBranchs = async (token) => {
        const params = {
            pageSize, // 페이지 크기
            pageNumber, // 현재 페이지 번호
        };

        // 검색 조건이 있다면
        if (searchName && searchName.trim() !== '') {
            // 검색어(지점명)를 params에 추가
            params.branchName = searchName;
        }

        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/branchs/paged`, {
                params,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });

            if (response.data && response.data.length === 0) {
                if (branchs.length !== 0) { 
                    setBranchs([]); // 상태가 이미 빈 배열이면 업데이트하지 않음
                }
                setPageNumber(1); 
                return;
            } else {
                setBranchs(response.data); // 응답이 있다면 지점 데이터 상태에 저장
                getTotalCount(); // 검색 결과에 맞는 총 개수 다시 가져오기
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    // 전체 지점 수 가져오기
    const getTotalCount = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            // 총 개수를 가져오는 함수 호출, await를 이용하여 API 요청 끝날때까지 대기 후 코드 실행
            await getCount(token);
        } catch (error) {
            if (error.response && error.response.status === 403) {
                try {
                    const newToken = await refreshAccessToken();
                    await getCount(newToken);
                } catch (error) {
                    alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
                    handleAdminLogout();
                }
            } else {
                console.error('There was an error fetching the branchs count!', error);
            }
        }
    };

    useEffect(() => {
        // 상태가 빈 배열이 되고, 검색어가 있는 경우에만 alert 실행
        if (branchs.length === 0 && searchName.trim() !== '') {
            setTimeout(() => {
                alert("존재하지 않는 지점명입니다. 다시 입력해주세요.");
            }, 0); // 비동기적으로 alert 호출
        }
    }, [branchs]); // branchs 상태 변경 감지
    

    // 총 지점 수 요청
    const getCount = async (token) => {
        // 검색어(searchName)이 있다면 params에 추가
        const params = searchName ? { branchName: searchName } : {};

        try {
            // API 요청: 지점 수 가져오기
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/branchs/count`,
                {
                    params,
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    withCredentials: true,
                });

            if (typeof response.data === 'number') {
                setTotalCount(response.data);
            }
        } catch (error) {
            console.error('총 지점 수를 가져오는데 실패했습니다:', error);
        }
    };

    // 페이지 번호 / 크기가 바뀔 때 데이터 요청
    useEffect(() => {
        pageingBranchs(); // 지점 데이터 가져오기
        getTotalCount(); // 전체 지점 수 가져오기
    }, [pageNumber, pageSize]); // 페이지 번호, 크기가 변경될 때 실행


    // 테이블 컬럼 너비 합산 계산
    const totalWidth = columnDefs.reduce((sum, columnDef) => {
        // columnDef[]에 컬럼 너비가 명시되어 있으면 더하고, 없으면 기본 값(150)을 더함
        return sum + (columnDef.width ? columnDef.width : 150);
    }, 0);

    // 변경된 현재 페이지 번호(-1씩 또는 +1씩 가감)
    const handlePageChange = (newPageNumber) => {
        setPageNumber(newPageNumber);
    };

    // 총 페이지 수 = 올림(전체 차종 수 / 화면에 보여줄 데이터 수(현재 페이지에서는 10개씩 보여줌))
    let totalPages = Math.ceil(totalCount / pageSize);
    if (totalPages < 1) {
        totalPages = 1;
    }


    // 검색 버튼
    const handleSearchClick = async () => {
         // 검색어를 입력하지 않은 경우
         if (!searchName || searchName.trim() === '') {
            alert("검색할 지점명을 입력해주세요!");
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');

            // DB에서 검색 결과 가져오기
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/branchs/paged`, {
                params: { branchName: searchName.trim() },
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            // 검색 결과가 없는 경우
            if (response.data.length === 0) {
                alert("존재하지 않는 지점명입니다. 다시 입력해주세요.");
                return;
            }

            // 검색 결과가 있는 경우
            pageingBranchs();
            getTotalCount();
            setBranchs(response.data);
            setIsSearched(true); // 검색 후 상태 업데이트

        } catch (error) {
            console.error("Error during branch search:", error);
            alert("검색 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    };

    // 검색어 초기화 함수
    const handleSearchReset = () => {
        setSearchName(''); // 검색어 초기화
        setBranchs([]); // 검색 결과 초기화
        setLoading(false); // 로딩 상태 초기화
        setIsSearched(false); // 검색 여부 초기화
    };

    // `searchName`이 변경되었을 때 (지점명을 검색했을 때) 데이터 다시 로드
    // 해당 useEffect가 없으면 방금 전 검색했던 지점명만 테이블에 표시 된다.
    useEffect(() => {
        if (searchName === '') {
            pageingBranchs();
            getTotalCount();
        }
    }, [searchName]);


    // 닫기 버튼
    const handleCloseClick = () => {
        if (onClick) {
            onClick();
        }
    };

    // 팝업 닫기
    const handlePopupCloseClick = () => {
        setIsCreatePopUp(false);
        setIsDetailPopUp(false);
        setIsUpdatePopUp(false);
        setBranchDetails([]);
    };

    // 추가 버튼
    const handleInsertClick = (workMode) => {
        viewDataInit();
        setIsCreatePopUp(true);
        setWorkMode(workMode);
    };

    // 삭제 버튼
    const handleDeleteClick = async (branchCode) => {
        if (window.confirm('지점을 정말로 삭제하시겠습니까?')) {
            try {
                const token = localStorage.getItem('accessToken');
                await deleteBranch(token, branchCode);
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    try {
                        const newToken = await refreshAccessToken();
                        await deleteBranch(newToken, branchCode);
                    } catch (error) {
                        alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
                        handleAdminLogout();
                    }
                } else if (error.response && error.response.status === 409) {
                    console.log(branchCode);
                    alert("예약된 건이 있어 지점 삭제를 할 수 없습니다. \n" + error);
                } else {
                    alert("삭제 중 오류가 발생했습니다. \n" + error);
                }
            }
        }
    };

    // 지점 삭제
    const deleteBranch = async (token, branchCode) => {
        await axios.delete(`${process.env.REACT_APP_API_URL}/arentcar/manager/branchs/${branchCode}`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            withCredentials: true,
        });

        // branchCode가 일치한다면 삭제 (일치하지 않는 지점은 그대로 냅둠), branch.branch_code == branchCode 라고 한다면 삭제하려는 지점만 남겨지고 나머지 모두 삭제 됨
        setBranchs((prevBranch) => prevBranch.filter(branch => branch.branch_code !== branchCode));

        // 전체 지점 수 감소
        setTotalCount((prevCount) => prevCount - 1);
        alert("지점이 삭제되었습니다.");
    };

    // 수정 버튼 클릭
    const handleUpdateClick = (findCode, workMode) => {
        setBranchCode(findCode.branch_code);
        setBranchName(findCode.branch_name);
        setIsUpdatePopUp(true);
        setWorkMode(workMode);
        setBranchLongitude(findCode.branch_longitude);
        setBranchLatitude(findCode.branch_latitude);
        setRegionCode(findCode.region_code);
        setRegionName(findCode.region_name);
        setPostCode(findCode.post_code);
        setBranchBasicAddress(findCode.branch_basic_address);
        setBranchDetailedAddress(findCode.branch_detailed_address);
        setBranchPhoneNumber(findCode.branch_phone_number);
        setAvailablePickupTime(findCode.available_pickup_time);
        setAvailableReturnTime(findCode.available_return_time);
    };

    // 지점 추가 시 데이터 초기화
    const viewDataInit = () => {
        setBranchCode("");
        setBranchName("");
        setBranchLongitude("");
        setBranchLatitude("");
        setRegionCode("1");
        setRegionName("경기");
        setPostCode("");
        setAvailablePickupTime("");
        setAvailableReturnTime("");
        setBranchBasicAddress("");
        setBranchDetailedAddress("");
        setBranchPhoneNumber("");
        setAvailablePickupTime("");
        setAvailableReturnTime("")
    };

    // 지점 추가 시 지점명, 지역코드, 상세주소, 전화번호 입력 필수
    const validateCheck = () => {
        if (!branchName || branchName.trim() === '') {
            alert("지점명을 입력해주세요.");
            return false;
        };
        if (!branchBasicAddress || branchBasicAddress.trim() === '') {
            alert("기본주소를 입력해주세요.");
            return false;
        };
        if (!branchDetailedAddress || branchDetailedAddress.trim() === '') {
            alert("상세주소를 입력해주세요.");
            return false;
        };
        if (!branchPhoneNumber || branchPhoneNumber.trim() === '') {
            alert("전화번호를 입력해주세요.");
            return false;
        };
        if (!availablePickupTime || availablePickupTime.trim() === '') {
            alert("개점시간을 입력해주세요.");
            return false;
        };
        if (!availableReturnTime || availableReturnTime.trim() === '') {
            alert("폐점시간을 입력해주세요.");
            return false;
        };
        return true;
    };

    // 지점 추가 전에 지점명 중복되는지 확인
    // validateCheck 함수는 클라이언트에서 간단한 검증을 처리
    // 서버와의 통신을 포함한 중복 체크는 별도의 비동기 함수로 처리하는 것이 일반적
    const isBranchNameDuplicate = async (branchName) => {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/branchs/check-duplicate`, {
            params: { branchName },
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
        });
        return response.data.isDuplicate;
    };


    // 지점 추가 및 수정
    const handleDataSaveClick = async () => {
        // 지점명, 지역코드, 상세주소, 전화번호 입력칸이 공란인지 검증
        if (!validateCheck()) {
            return;
        }

        // 전화번호 포맷팅
        const formattedPhoneNumber = formatPhoneNumber(branchPhoneNumber);

        let newBranch = {
            branch_code: branchCode,
            branch_name: branchName,
            branch_longitude: branchLongitude,
            branch_latitude: branchLatitude,
            region_code: regionCode,
            region_name: regionName,
            post_code: postCode,
            branch_basic_address: branchBasicAddress,
            branch_detailed_address: branchDetailedAddress,
            branch_phone_number: formattedPhoneNumber,
            available_pickup_time: availablePickupTime,
            available_return_time: availableReturnTime,
        };

        if (workMode === "수정") {
            try {
                setLoading(true);
                const token = localStorage.getItem('accessToken');
                await updateBranch(token, newBranch);
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    try {
                        const newToken = await refreshAccessToken();
                        await updateBranch(newToken, newBranch);
                    } catch (error) {
                        alert("인증이 만료되었습니다. 다시 로그인 해주세요." + error);
                        handleAdminLogout();
                    }
                } else {
                    alert("지점 수정 중 오류가 발생했습니다. \n" + error);
                }
            } finally {
                setLoading(false);
                setIsUpdatePopUp(false);
            }
        } else if (workMode === "추가") {
            try {
                setLoading(true);
                // 지점명 중복 입력 검증
                const isBranchDuplicate = await isBranchNameDuplicate(branchName);
                if (isBranchDuplicate) {
                    alert("동일한 지점명이 이미 존재합니다. 다른 이름을 입력해주세요.");
                    return;
                }
                const token = localStorage.getItem('accessToken');
                await createBranch(token, newBranch);
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    try {
                        const newToken = await refreshAccessToken();
                        await createBranch(newToken, newBranch);
                    } catch (error) {
                        alert("인증이 만료되었습니다. 다시 로그인 해주세요." + error);
                        handleAdminLogout();
                    }
                } else {
                    alert("지점 추가 중 오류가 발생했습니다. \n" + error);
                }
            } finally {
                setLoading(false);
                setIsCreatePopUp(false);
            }
        } else if (workMode === "상세") {
            try {
                setLoading(true);
                if (!branchCode) {
                    return;
                }

                const token = localStorage.getItem('accessToken');
                await getBranchDetails(token, branchCode);
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    try {
                        const newToken = await refreshAccessToken();
                        await getBranchDetails(newToken, branchCode);
                    } catch (error) {
                        alert("인증이 만료되었습니다. 다시 로그인 해주세요." + error);
                        handleAdminLogout();
                    }
                } else {
                    alert("지점 상세 조회 중 오류가 발생했습니다. \n" + error);
                }
            } finally {
                setLoading(false);
            }
            setBranchDetails(false);
        };
    }

    // 지점 수정
    const updateBranch = async (token, newBranch) => {
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/arentcar/manager/branchs/${branchCode}`,
                newBranch,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                }
            );
            // 수정 성공 후 로컬 상태 업데이트
            setBranchs((prevBranch) => prevBranch.map(branch => branch.branch_code === branchCode ? newBranch : branch));
            alert("지점이 수정 되었습니다.");
        } catch (error) {
            console.error("Error updating branch:", error);
        }
    };


    // 지점 추가
    const createBranch = async (token, newBranch) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/arentcar/manager/branchs`,
                newBranch,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    withCredentials: true,
                });
            newBranch.branch_code = response.data.branch_code;
            newBranch.branch_name = response.data.branch_name;

            // 전체 지점 수 증가
            setTotalCount((prevCount) => {
                const updatedCount = prevCount + 1;

                // 페이지 번호를 마지막 페이지로 이동
                const totalPages = Math.ceil(updatedCount / pageSize); // 새로 추가한 지점 포함한 총 페이지 수 계산

                setPageNumber(totalPages); // 마지막 페이지로 이동
                return updatedCount; // 상태 업데이트 후 return
            });

            // 새로 추가 된 지점을 상태에 추가
            setBranchs((prevBranch) => [...prevBranch, newBranch]);
            
            alert("지점이 추가 되었습니다.");
        } catch (error) {
            console.error("지점 추가 실패:", error);
            throw error;
        }
    };

    // 지점 상세 팝업창 열기
    const fetchBranchDetails = async (branchCode) => {
        console.log("[fetchBranchDetails] 시작 - branchCode:", branchCode); // 함수 시작

        try {
            const token = localStorage.getItem("accessToken");
            await getBranchDetails(token, branchCode);
        } catch (error) {
            if (error.response && error.response.status === 403) {
                try {
                    const newToken = await refreshAccessToken();
                    console.log("[fetchBranchDetails] 새 토큰 발급 성공:", newToken); // 새 토큰 확인
                    await getBranchDetails(newToken, branchCode);

                } catch (error) {
                    console.error("[fetchBranchDetails] 토큰 갱신 실패:", error);
                    alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
                    handleAdminLogout();
                }
            } else {
                console.error("[fetchBranchDetails] 예외 처리되지 않은 에러:", error);
                // console.error("There was an error fetching the branchs details!", error);
            }
        }
    };

    // 지점 상세 정보 얻어오기
    const getBranchDetails = async (token, branchCode) => {
        console.log("[getBranchDetails] 시작 - token:", token, "branchCode:", branchCode);

        if (!branchCode) {
            console.error("[getBranchDetails] branchCode가 없습니다!");
            return;
        }

        try {
            const url = `${process.env.REACT_APP_API_URL}/arentcar/manager/branchs/detail/${branchCode}`;
            console.log("[getBranchDetails] API 요청 URL:", url);
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });
            console.log("[getBranchDetails] 응답 성공:", response.data);
            setBranchDetails(response.data);
        } catch (error) {
            console.error("[getBranchDetails] 에러 발생:", error);
            if (error.response) {
                console.error("[getBranchDetails] 서버 응답 에러:", error.response.data);
            }
            throw error; // 상위로 에러 전달
        }
    };

    // 지점 상세 버튼 클릭
    const handleDetailClick = (row, workMode) => {

        const branchCode = row.branch_code;

        if (!row.branch_code) {
            console.error("Invalid branchCode:", branchCode);
            return;
        }
        setIsDetailPopUp(true);
        setWorkMode(workMode);
        fetchBranchDetails(branchCode);
    };

    // 지역이름 드롭박스 데이터 가져오기
    useEffect(() => {
        const fetchRegionNameMenus = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                await getRegionNameMenuOptions(token);
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    try {
                        const newToken = await refreshAccessToken();
                        await getRegionNameMenuOptions(newToken);
                    } catch (refreshError) {
                        alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
                        handleAdminLogout();
                    }
                } else {
                    console.error('There was an error fetching the regionNameMenu!', error);
                }
            }
        };

        fetchRegionNameMenus();
    }, []);

    // 지역이름 얻어오기
    const getRegionNameMenuOptions = async (token) => {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/branchs/option`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
        });
        setRegionNameMenuOptions(response.data);
    };


    // 개점시간 입력 포맷 설정 (09:00)
    const formatPickupTime = (available_pickup_time) => {
        if (available_pickup_time && available_pickup_time.length === 4) {
            // '0900' -> '09:00'
            return `${available_pickup_time.slice(0, 2)}:${available_pickup_time.slice(2, 4)}`;
        }
        // 기본값으로 원래 시간 반환
        return available_pickup_time; // 
    };

    const handlePickupTimeChange = (e) => {
        const input = e.target.value.replace(/[^0-9:]/g, ""); // 숫자와 ':'만 허용
        const formatted = input.replace(":", ""); // ':' 제거한 값 (저장된 값이 09:00 이기 때문)

        // 최대 4자리까지만 상태 저장
        if (formatted.length <= 4) {
            if (formatted.length === 4 && !isValidTimeFormat(formatted)) {
                alert("00:00 ~ 23:59 까지만 입력할 수 있습니다.");
                // 잘못된 형식일 경우 상태 변경하지 않음
                return;
            }
            // 정상 입력이라면 상태 갱신
            setAvailablePickupTime(formatted);
        }
    };

    // 폐점시간 입력 포맷 설정 (09:00)
    const formatReturnTime = (available_return_time) => {
        if (available_return_time && available_return_time.length === 4) {
            return `${available_return_time.slice(0, 2)}:${available_return_time.slice(2, 4)}`;
        }
        return available_return_time; // 
    };

    const handleReturnTimeChange = (e) => {
        const input = e.target.value.replace(/[^0-9:]/g, "");
        const formatted = input.replace(":", "");

        if (formatted.length <= 4) {
            if (formatted.length === 4 && !isValidTimeFormat(formatted)) {
                alert("00:00 ~ 23:59 까지만 입력할 수 있습니다.");
                return;
            }
            setAvailableReturnTime(formatted);
        }
    };


    // 매장 전화번호 형식 변환 함수
    const formatPhoneNumber = (branch_phone_number) => {
        if (branch_phone_number && branch_phone_number.length === 10) {
            // '0311234567' -> '031-123-4567'
            return `${branch_phone_number.slice(0, 3)}-${branch_phone_number.slice(3, 6)}-${branch_phone_number.slice(6, 10)}`;
        }
        // 기본값으로 원래 전화번호 반환
        return branch_phone_number;
    };

    // 지점 추가 및 수정의 전화번호 입력 칸에서 포맷팅
    const handlePhoneNumberChange = (e) => {
        let input = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 허용

        // 숫자만 저장
        setBranchPhoneNumber(input); 
    }

    return (
        <div className='register-branch-wrap'>
            <div className='register-branch-header-wrap'>
                <div className='register-branch-title-wrap'>
                    <div className='manager-title'>● 지점관리</div>
                </div>
                <div
                    className='register-branch-button-wrap'
                    style={{ width: `${totalWidth}px` }}
                >
                    <div className='flex-align-center'>
                        <label className='manager-label' htmlFor="">지점명</label>
                        <input className='width200' type="text" value={searchName} onChange={(e) => (setSearchName(e.target.value))} />
                        <button className='manager-button manager-button-search' onClick={() => handleSearchClick()}>검색</button>
                        <span>[검색건수 : {totalCount}건]</span>
                    </div>
                    <div>
                        <button className='manager-button manager-button-insert' onClick={() => handleInsertClick("추가")}>추가</button>
                        <button className='manager-button manager-button-reset' onClick={handleSearchReset} disabled={!isSearched}
                            style={{
                                color: isSearched ? 'rgb(38, 49, 155)' : '#AAAAAA', // 조건에 맞게 color 변경
                                cursor: isSearched ? 'pointer' : 'not-allowed', // disabled일 때 커서 스타일 변경
                            }}>초기화
                        </button>
                        <button className='manager-button manager-button-close' onClick={() => handleCloseClick()}>닫기</button>
                    </div>
                </div>
            </div>
            <div className='register-branch-content-wrap'>
                <div className='register-branch-content-header'>
                    {columnDefs.map((title, index) => (
                        <div key={index} className='manager-head-column' style={{ width: `${title.width}px`, textAlign: `center` }}>{title.headerName}</div>
                    ))}
                </div>
            </div>

            {/* 지점 추가 팝업 */}
            {isCreatePopUp &&
                <div className='manager-branch-create-popup manager-popup'>
                    <div className='register-branch-content-popup-wrap'>
                        <div className='register-branch-content-popup-close'>
                            <div className='manager-popup-title'>● 지점{workMode}</div>
                            <div className='branch-info-content-popup-button'>
                                <button className='manager-button manager-button-save' onClick={handleDataSaveClick}>저장</button>
                                <button className='manager-button manager-button-close' onClick={handlePopupCloseClick}>닫기</button>
                            </div>
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-center label-margin-right' htmlFor="branchCode">지점코드</label>
                            <input className='width50 word-center' type="text" value={branchCode} disabled />
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="branchName">지점명</label>
                            <input className='width300 word-left' value={branchName} placeholder='지점명을 입력해주세요.' type="text" maxLength={30} onChange={(e) => setBranchName(e.target.value)} autoFocus />
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="branchLongitude">경도</label>
                            <input className='width300 word-left' value={branchLongitude} placeholder='경도를 입력해주세요.' type="text" maxLength={30} onChange={(e) => setBranchLongitude(e.target.value)} />
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="branchLatitude">위도</label>
                            <input className='width300 word-left' value={branchLatitude} placeholder='위도를 입력해주세요.' type="text" maxLength={30} onChange={(e) => setBranchLatitude(e.target.value)} />
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="regionCode">지역코드</label>
                            <input className='width300 word-left' value={regionCode} onChange={(e) => setRegionCode(e.target.value)} />
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="regionName">지역이름</label>
                            <select className='width100 word-left' id="regionName" value={regionCode}
                                onChange={(e) => {
                                    // 지역 이름을 선택했을 때, 선택한 지역코드를 자동으로 설정
                                    const selectedRegionCode = e.target.value;
                                    // 지역코드 업데이트
                                    setRegionCode(selectedRegionCode);
                                    // 지역이름 업데이트
                                    setRegionName(e.target.options[e.target.selectedIndex].text);
                                }}>
                                {regionNameMenuOptions.map((option) => (
                                    <option key={option.region_code} value={option.region_code}>
                                        {option.region_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="postCode">우편번호</label>
                            <input className='width300' type="text" value={postCode} placeholder='우편번호를 입력해주세요.' maxLength={5} onChange={(e) => setPostCode(e.target.value)} />
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="branchBasicAddress">기본주소</label>
                            <input className='width300' type="text" value={branchBasicAddress} placeholder='기본주소를 입력해주세요.' maxLength={50} onChange={(e) => setBranchBasicAddress(e.target.value)} />
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="branchDetailedAddress">상세주소</label>
                            <input className='width300' type="text" value={branchDetailedAddress} placeholder='상세주소를 입력해주세요.' maxLength={50} onChange={(e) => setBranchDetailedAddress(e.target.value)} />
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="branchPhoneNumber">전화번호</label>
                            <input className='width300' type="text" value={formatPhoneNumber(branchPhoneNumber)} placeholder='전화번호를 입력해주세요.' maxLength={12} onChange={(e) => handlePhoneNumberChange(e)} />
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="availablePickupTime">개점시간</label>
                            {/* maxLength={5}인 이유는 '09:00', 콜론 */}
                            <input className='width300' type="text" value={formatPickupTime(availablePickupTime)} placeholder='개점시간을 입력해주세요.' maxLength={5} onChange={(e) => handlePickupTimeChange(e)} />
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="availableReturnTime">폐점시간</label>
                            <input className='width300' type="text" value={formatReturnTime(availableReturnTime)} placeholder='폐점시간을 입력해주세요.' maxLength={5} onChange={(e) => handleReturnTimeChange(e)} />
                        </div>
                    </div>
                </div>
            }

            {/* 지점 수정 팝업 */}
            {isUpdatePopup &&
                <div className='manager-branch-update-popup manager-popup'>
                    <div className='manager-branch-update-popup-wrap'>
                        <div className='manager-branch-update-popup-close'>
                            <div className='manager-popup-title'>● 지점{workMode}</div>
                            <div className='branch-info-content-popup-button'>
                                <button className='manager-button manager-button-save' onClick={handleDataSaveClick}>저장</button>
                                <button className='manager-button manager-button-close' onClick={handlePopupCloseClick}>닫기</button>
                            </div>
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="branchCode">지점코드</label>
                            <input className='width50 word-center' type="text" value={branchCode} disabled />
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="branchName">지점명</label>
                            <input className='width300 word-left' value={branchName} type="text" maxLength={30} disabled />
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="branchLongitude">경도</label>
                            <input className='width300 word-left' value={branchLongitude} placeholder='경도를 입력해주세요.' type="text" maxLength={30} onChange={(e) => setBranchLongitude(e.target.value)} />
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="branchLatitude">위도</label>
                            <input className='width300 word-left' value={branchLatitude} placeholder='위도를 입력해주세요.' type="text" maxLength={30} onChange={(e) => setBranchLatitude(e.target.value)} />
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="regionCode">지역코드</label>
                            <input className='width300 word-left' value={regionCode} onChange={(e) => setRegionCode(e.target.value)} />
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="regionName">지역이름</label>
                            <select className='width100 word-left' id="regionName" value={regionCode}
                                onChange={(e) => {
                                    // 지역 이름을 선택했을 때, 선택한 지역코드를 자동으로 설정
                                    const selectedRegionCode = e.target.value;
                                    // 지역코드 업데이트
                                    setRegionCode(selectedRegionCode);
                                    // 지역이름 업데이트
                                    setRegionName(e.target.options[e.target.selectedIndex].text);
                                }}>
                                {regionNameMenuOptions.map((option) => (
                                    <option key={option.region_code} value={option.region_code}>
                                        {option.region_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="postCode">우편번호</label>
                            <input className='width300' type="text" value={postCode} placeholder='우편번호를 입력해주세요.' maxLength={5} onChange={(e) => setPostCode(e.target.value)} />
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="branchBasicAddress">기본주소</label>
                            <input className='width300' type="text" value={branchBasicAddress} placeholder='기본주소를 입력해주세요.' maxLength={50} onChange={(e) => setBranchBasicAddress(e.target.value)} />
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="branchDetailedAddress">상세주소</label>
                            <input className='width300' type="text" value={branchDetailedAddress} placeholder='상세주소를 입력해주세요.' maxLength={50} onChange={(e) => setBranchDetailedAddress(e.target.value)} />
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="branchPhoneNumber">전화번호</label>
                            {/* maxLength={12}: "010-123-1234" 기준 최대 길이 */}
                            <input className='width300' type="text" value={formatPhoneNumber(branchPhoneNumber)} placeholder='전화번호를 입력해주세요.' maxLength={12} onChange={(e) => handlePhoneNumberChange(e)} />
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="availablePickupTime">개점시간</label>
                            {/* maxLength={5}인 이유는 '09:00', 콜론 */}
                            <input className='width300' type="text" value={formatPickupTime(availablePickupTime)} placeholder='개점시간을 입력해주세요.' maxLength={5} onChange={(e) => handlePickupTimeChange(e)} />
                        </div>
                        <div className='register-branch-content-popup-line'>
                            <label className='width80 word-right label-margin-right' htmlFor="availableReturnTime">폐점시간</label>
                            <input className='width300' type="text" value={formatReturnTime(availableReturnTime)} placeholder='폐점시간을 입력해주세요.' maxLength={5} onChange={(e) => handleReturnTimeChange(e)} />
                        </div>
                    </div>
                </div>
            }

            {/* 지점 상세 팝업 */}
            {isDetailPopUp &&
                <div className='manager-branch-detail-popup manager-popup'>
                    <div className='manager-branch-detail-popup-wrap'>
                        <div className='manager-branch-detail-popup-close'>
                            <div className='manager-popup-title'>● 지점{workMode}</div>
                            <div className='branch-info-content-popup-button'>
                                <button className='manager-button manager-button-close' onClick={handlePopupCloseClick}>닫기</button>
                            </div>
                        </div>

                        {/* 지점코드 */}
                        <div className='manager-branch-popup-high-branch-id'>
                            <label>지점코드: </label>
                            <span> {branchDetails.branch_code}</span>
                        </div>

                        {/* 지점정보 */}
                        <div className="manager-branch-popup-section">
                            <div className="manager-branch-popup-section-title">지점정보</div>
                            <div className="manager-branch-popup-field-row">
                                <label>지점명 : </label>
                                <span>{branchDetails.branch_name}</span>
                                <label>전화번호 : </label>
                                <span>{formatPhoneNumber(branchDetails.branch_phone_number)}</span>
                            </div>
                            <div className="manager-branch-popup-field-row">
                                <label>기본주소 : </label>
                                <span>{branchDetails.branch_basic_address}</span>
                            </div>
                            <div className="manager-branch-popup-field-row">
                                <label>상세주소 : </label>
                                <span>{branchDetails.branch_detailed_address}</span>
                            </div>
                        </div>

                        {/* 지역정보*/}
                        <div className="manager-branch-popup-section">
                            <div className="manager-branch-popup-section-title">지역정보</div>
                            <div className="manager-branch-popup-field-row">
                                <label>지역코드 : </label>
                                <span>{branchDetails.region_code}</span>
                                <label>지역이름 : </label>
                                <span>{branchDetails.region_name}</span>
                            </div>
                            <div className="manager-branch-popup-field-row">
                                <label>우편번호 : </label>
                                <span>{branchDetails.post_code}</span>
                            </div>
                            <div className="manager-branch-popup-field-row">
                                <label>위도 : </label>
                                <span>{branchDetails.branch_longitude}</span>
                            </div>
                            <div className="manager-branch-popup-field-row">
                                <label>경도 : </label>
                                <span>{branchDetails.branch_latitude}</span>
                            </div>
                        </div>

                        {/* 영업정보 */}
                        <div className="manager-branch-popup-section">
                            <div className="manager-branch-popup-section-title">영업정보</div>
                            <div className="manager-branch-popup-field-row">
                                <label>개점시간 : </label>
                                <span>{formatTime(branchDetails.available_pickup_time)}</span>
                                <label>폐점시간 : </label>
                                <span>{formatTime(branchDetails.available_return_time)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            }

            {/* map을 이용하여 columDefs 배열에 있는 내용 출력 */}
            <div className='register-branchs-content-row-wrap'>
                {branchs.map((row, index) => (
                    <div key={index} className='register-branchs-content-row'>
                        {columnDefs.map((title, index) => (
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
                                        <button className='manager-button manager-branch-button-update' onClick={() => handleUpdateClick(row, "수정")}>수정</button>
                                        <button className='manager-button manager-branch-button-delete' onClick={() => handleDeleteClick(row.branch_code)}>삭제</button>
                                        <button className='manager-button manager-branch-button-detail' onClick={() => handleDetailClick(row, "상세")}>상세</button>
                                        
                                        
                                    </>
                                ) : (
                                    <div>
                                        {(title.field === 'available_pickup_time' || title.field === 'available_return_time') ? (
                                            formatTime(row[title.field]) // 시간 필드만 09:00 형식으로 표시되게 포맷
                                        ) : title.field === 'branch_phone_number' ? (
                                            formatPhoneNumber(row[title.field]) // 전화번호 필드 포맷
                                        ) : (
                                            row[title.field] // 다른 필드는 그대로 출력
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* 다음, 이전 버튼 */}
            <div className='branch-info-pageing-wrap flex-align-center'>
                <button
                    className='manager-button'
                    style={{ color: pageNumber === 1 ? '#aaa' : 'rgb(38, 49, 155)' }}
                    onClick={() => handlePageChange(pageNumber - 1)}
                    disabled={pageNumber === 1}
                >이전</button>
                <div className='branch-info-pageing-display'>{pageNumber} / {totalPages}</div> {/* 현재 페이지 / 전체 페이지 */}
                <button
                    className='manager-button'
                    style={{ color: pageNumber === totalPages ? '#aaa' : 'rgb(38, 49, 155)' }}
                    onClick={() => handlePageChange(pageNumber + 1)}
                    disabled={pageNumber === totalPages}
                >다음</button>
            </div>
            {loading && (
                <Loading />
            )}
        </div>
    );
}
export default ManageBranchs