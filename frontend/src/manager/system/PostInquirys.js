import { useEffect, useRef, useState } from "react";
import "./PostInquirys.css"
import axios from "axios";
import { refreshAccessToken, handleLogout } from 'common/Common';
import { store } from '../../redux/store';
import Loading from 'common/Loading';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";




const PostInquirys = ({ onClick }) => {
  const [loading, setLoading] = useState(false);
  const Type = {"NT":"공지","RV":"후기","IQ":"문의"}
  const status = {"IQ":"답변대기중","RS":"답변완료"}
  const [inquirys, setInquirys] = useState([])
  //팝업창
  const [isPopUp, setIsPopUp] = useState(false);
  //검색/페이징
  const [searchName, setSearchName] = useState("");
  const [pageNumber, setPageNumber] = useState(0);
  const pageSize = 10;
  const [totalInquirys,setTotalInquirys] = useState();
  //컬럼
  const [columnInquirys] = useState([
    { columnName: '코드', field: 'post_code', width: 100, align: 'center'},
    { columnName: '구분', field: 'post_type', width: 100, align: 'center'},
    { columnName: '제목', field: 'post_title', width: 400, align: 'left'},
    { columnName: '작성자', field: 'author', width: 150, align: 'center'},
    { columnName: '작성일', field: 'created_at', width: 150, align: 'center'},
    { columnName: '답변여부', field: 'inquiry_status', width: 100, align: 'center'},
    { columnName: '작업', field: '', width: 230, align: 'center'},
  ]);

  const isLoginState = useSelector((state) => state.adminState.loginState);
  const navigate = useNavigate();

  // 상세내용
  const [postCode,setPostCode] = useState();
  const [responseCode,setResponseCode] = useState();
  const [postTitle,setPostTitle] = useState("");
  const [postContent,setPostContent] = useState("");
  const [authorCode,setAuthorCode] = useState();
  const [authorType,setAuthorType] = useState();
  const [authorName,setAuthorName] = useState();
  //답변
  const [responses,setResponses] = useState([]);
  const [createContent,setCreateContent] = useState("");

  const postGetInquirys = async () =>{
    try {
      const token = localStorage.getItem('accessToken');
      await getInquirys(token);
    } catch (error) {
      if(error.response && error.response.status === 403) {
        try {
          const newToken = await refreshAccessToken();
          await getInquirys(newToken);
        } catch (error) {
          alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
          handleLogout();
        }
      } else {
        console.error('There was an error fetching the movies!', error);
      }
    }
  }
  const getInquirys = async (token)=>{
    const params = {
      pageSize,
      pageNumber,
    };

    if(searchName && searchName.trim() !== "") {
      params.postName = searchName;
    }

    const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/post/inquirys`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      }
    );
    if(response.data) {
      setInquirys(response.data);      
    }
  }

  const postGetCount = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await getCount(token);
    } catch (error) {
      if(error.response && error.response.status === 403) {
        try {
          const newToken = await refreshAccessToken();
          await getCount(newToken);
        } catch (error) {
          alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
          handleLogout();
        }
      } else {
        console.error('There was an error fetching the movies!', error);
      }
    }
  }
  const getCount = async (token) => {
    const params = searchName && searchName.trim() !== "" ? { postName: searchName } : {}
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/post/inquirys/count`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      });
    if(typeof response.data === "number") {
      setTotalInquirys(response.data);
    } else {
      console.error('Unexpected response:', response.data);
    }
  }

  const postGetCodeInquiry = async (code) =>{
    try {
      const token = localStorage.getItem('accessToken');
      await getInquiry(token,code);
    } catch (error) {
      if(error.response && error.response.status === 403) {
        try {
          const newToken = await refreshAccessToken();
          await getInquiry(newToken,code);
        } catch (error) {
          alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
          handleLogout();
        }
      } else {
        console.error('There was an error fetching the movies!', error);
      }
    }
  }
  const getInquiry = async (token,code)=>{
    
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/post/inquirys/${code}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      }
    );
    if(response.data) {
      setPostCode(response.data.post_code);
      setResponseCode(response.data.response_code);
      setPostTitle(response.data.post_title);
      setPostContent(response.data.post_content);
      setAuthorType(response.data.author_type);
      setAuthorName(response.data.author);
    }
  }

  const postGetResponses = async (code) =>{
    try {
      const token = localStorage.getItem('accessToken');
      await getResponses(token,code);
    } catch (error) {
      if(error.response && error.response.status === 403) {
        try {
          const newToken = await refreshAccessToken();
          await getResponses(newToken,code);
        } catch (error) {
          alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
          handleLogout();
        }
      } else {
        console.error('There was an error fetching the movies!', error);
      }
    }
  }
  const getResponses = async (token,code)=>{
    
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/post/responses/${code}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      }
    );
    if(response.data) {
      setResponses(response.data);
    }
  }

  const postUpdateResponses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      await updateResponses(token);
    } catch (error) {
      if(error.response && error.response.status === 403) {
        try {
          const newToken = await refreshAccessToken();
          await updateResponses(newToken);
        } catch (error) {
          alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
          handleLogout();
        }
      } else {
        console.error('There was an error fetching the movies!', error);
      }
    } finally {
      setLoading(false);
    }
  }
  const updateResponses = async (token) => {
    const response = await axios.put(`${process.env.REACT_APP_API_URL}/arentcar/manager/post/responses`,
      responses,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      }
    );
  }

  const postCreateResponses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      await createResponses(token);
    } catch (error) {
      if(error.response && error.response.status === 403) {
        try {
          const newToken = await refreshAccessToken();
          await createResponses(newToken);
        } catch (error) {
          alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
          handleLogout();
        }
      } else {
        console.error('There was an error fetching the movies!', error);
      }
    } finally {
      setLoading(false);
    }
  }
  const createResponses = async (token) => {
    const newResponses = {
      response_content:null,
      post_code: postCode,
      response_content: createContent,
      author_code: authorCode,
      author_type: authorType,
      author: null,
      created_at: null,
      updated_at: null,
    }

    const response = await axios.post(`${process.env.REACT_APP_API_URL}/arentcar/manager/post/responses`,
      newResponses,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      }
    )
    alert("답변이 작성되었습니다.");
  }

  const postDeleteResponses = async (code) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      await deleteResponses(token,code);
    } catch (error) {
      if(error.response && error.response.status === 403) {
        try {
          const newToken = await refreshAccessToken();
          await deleteResponses(newToken,code);
        } catch (error) {
          alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
          handleLogout();
        }
      } else {
        console.error('There was an error fetching the movies!', error);
      }
    } finally {
      setLoading(false);
    }
  }
  const deleteResponses = async (token, code) => {
    const response = await axios.delete(`${process.env.REACT_APP_API_URL}/arentcar/manager/post/responses/${code}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      }
    )
    alert("답변이 삭제되었습니다.");
  }

  const postDeleteInquiry = async (code) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      await deleteInquiry(token, code)
    } catch (error) {
      if(error.response && error.response.status === 403) {
        try {
          const newToken = await refreshAccessToken();
          await deleteInquiry(newToken,code);
        } catch (error) {
          alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
          handleLogout();
        }
      } else {
        console.error('There was an error fetching the movies!', error);
      }
    } finally {
      setLoading(false);
    }
  }

  const deleteInquiry = async (token, code) => {
    const response = await axios.delete(`${process.env.REACT_APP_API_URL}/arentcar/manager/post/inquirys/${code}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      }
    )
  }
  
  useEffect(()=>{
    handleLogin();
    postGetCount();
    postGetInquirys();
    handleAdminCode();
    
  },[pageNumber, totalInquirys])

  useEffect(()=>{
    handleLogin();
    resizeHeight();
  },[responses])

  const handleLogin = () => {
    if (!isLoginState) {
      alert("로그인이 필요합니다.");
      navigate("/admin");
      return;
    }
  }

  const handleSearchClick = async () => {
    postGetInquirys();
    postGetCount();
    setPageNumber(0);
  }

  const handleAdminCode = async () => {
    setAuthorCode(store.getState().adminState.adminCode);
    setAuthorName(store.getState().adminState.adminName);
  }

  //페이지 뒤로
  const handleCloseClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleAnswer = (i) => {
    setCreateContent("");
    postGetCodeInquiry(i);
    postGetResponses(i).then(()=>{
      setIsPopUp(true);
    });
    

    // for (const Height of textarea.current) {}
    // textarea.current[0].dispatchEvent(new Event('change', { bubbles: true }));
  }

  const handleUpdateResponses = () => { //update state
    if(window.confirm('수정하시겠습니까?')) {
      postUpdateResponses();
    }
  }

  const handleDeleteResponses = (code) => { //update state
    if(window.confirm('삭제하시겠습니까?')) {
      postDeleteResponses(code).then(function (value) {
        //성공했을 때 실행
        postGetResponses(postCode);
      }, function (reason) {
        //실패했을 때 실행
        alert("삭제에 실패했습니다.")
      });
    }
  }

  const handleCreate = () => { //update state
    if(createContent !== "") {
      postCreateResponses().then(function (value) {
        //성공했을 때 실행
        postGetInquirys();
        postGetResponses(postCode);
        setCreateContent("");
      }, function (reason) {
        //실패했을 때 실행
        alert("작성의 실패했습니다.")
      });
    } else {
      alert("답변을 입력해주세요.")
    }
  }

  const handleDeleteInquiry = (code) => {
    if(window.confirm('삭제하시겠습니까?')) {
      postDeleteInquiry(code).then(()=>{
        postGetCount();
      });
    }
  }

  const textarea = useRef([]);
  const resizeHeight = () => {
    for (const Height of textarea.current) {
      if(Height) {
        Height.style.height = "auto";
        Height.style.height = Height.scrollHeight + "px";
      }
    }
    return "";
  }
  const handleResizeHeight = (e,i) => {
    const copy = [...responses]
    copy[i].response_content = e.target.value;
    setResponses(copy)
    // setPostContent(e.target.value);
    resizeHeight();
      // if(textarea.current[index]) {
      //   list.current[index].style.height = "auto";
      //   list.current[index].style.height = textarea.current[index].scrollHeight + "px";
      // }
  }
  const handleCreateResizeHeight = (e) => {
    setCreateContent(e.target.value);
    resizeHeight();
  }
  let totalPages = Math.ceil(totalInquirys / pageSize);
  if (totalPages < 1) { totalPages = 1; }
  if (totalInquirys === 0) { totalPages = 0; }

  const handleColumn = (value, column) => {
    if(column.field === '') {
      return(<>
        {/* <button className='manager-button post-btn3' > 보기 </button>  */}
        <button className='manager-button post-btn1' onClick={()=>handleAnswer(value["post_code"])}> 답변 </button> 
        <button className='manager-button post-btn2' onClick={()=>handleDeleteInquiry(value["post_code"])}> 삭제 </button> 
      </>)
    } else if(column.field === 'post_type') {
      return( Type[value[column.field]] )
    } else if(column.field === "inquiry_status") {
      return( status[value[column.field]] )
    } else {
      return( value[column.field] )
    }
  }

  return(
    <div className='manager-post-inquirys-wrap'>
      <div className='manager-post-inquirys-header-wrap'>
        <div className='manager-post-inquirys-header-title'>
          <h5 className='manager-post-inquirys-header-h5'> 고객문의 게시판 </h5>
        </div>
      </div>

      <div className='manager-post-inquirys-table-wrap'>
        <div className='manager-post-inquirys-table-head'>
          <div className='flex-align-center'>
            <label className='manager-label' htmlFor="manager-post-serch">제목</label>
            <input id='manager-post-serch' className='width200' type="text"
              value={searchName}
              onChange={(e)=>(setSearchName(e.target.value))} 
              onKeyDown={(e)=>{if(e.key === "Enter") {handleSearchClick()} }}></input>
            <button className='manager-button manager-button-search' onClick={()=>handleSearchClick()}> 검색 </button>
            <span> [ 검색건수 : {totalInquirys}건 ] </span>
          </div>

          <div>
              {/* <button className='manager-button manager-button-insert' onClick={()=>{}}> 추가</button> */}
              <button className='manager-button manager-button-close' onClick={()=>handleCloseClick()}> 닫기</button>
          </div>
        </div>

        <table className='manager-post-inquirys-table-body'>
          <thead>
            <tr>
              {columnInquirys && (columnInquirys.map((column,index)=>(
                  <th key={index} className='manager-post-inquirys-table-head-colmn' style={{ width: `${column.width}px`, textAlign: `center` }}>
                    {column.columnName}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
          {inquirys && (
            inquirys.map((inquiry, index)=>(
              <tr key={index}>
                {columnInquirys && (columnInquirys.map((column,index)=>(
                  <td key={index} className='manager-post-inquirys-table-row-colmn'
                    style={{width:`${column.width}`, textAlign:`${column.align}`}}> 

                    {handleColumn(inquiry,column)}
                  </td>
                )))}
              </tr>
            ))
          )}
          </tbody>
        </table>
        {isPopUp && (
          <div className='manager-post-inquirys-popup'>
            <div className='manager-post-inquirys-popup-wrap'>
              <div className='manager-post-inquirys-popup-header'>
                <div className='manager-post-inquirys-popup-title'> <h6 className='manager-post-inquirys-h6'> 문의사항 </h6> </div>
                <div className='manager-post-inquirys-popup-buttons'>
                  <button className='manager-button manager-post-inquirys-popup-save' onClick={()=>handleUpdateResponses()}> 수정 </button>
                  <button className='manager-button manager-post-inquirys-popup-close' onClick={()=>{setIsPopUp(!isPopUp)}}> 닫기 </button>
                </div>
              </div>
              <hr/>
              <div className='manager-post-inquirys-popup-line'>
                <div className="manager-post-inquirys-popup-line-header">
                  <div className="manager-post-inquirys-popup-line-header-title">
                    {postTitle}
                  </div>
                  <div className="manager-post-inquirys-popup-line-header-author">
                    작성자 : {authorName}
                  </div>
                </div>
                <div className="manager-post-inquirys-popup-line-body">
                  {postContent}
                </div>
              </div>
              {responses && (
                responses.map((response, index)=>(
                <div key={index}>
                <hr/>
                <div className='manager-post-inquirys-popup-line'>
                  <div className="manager-post-inquirys-popup-line-header">
                    <div className="manager-post-inquirys-popup-line-header-title">
                      {response.author_type === "US" ? (<>작성자</>) : (<>관리자</>)} : {response.author}
                    </div>
                    <div className="manager-post-inquirys-popup-line-header-author">
                      {response.created_at} 
                      {response.author_type === "AM" && (
                        <>
                          &nbsp;
                          <button onClick={()=>handleDeleteResponses(response.response_code)} style={{backgroundColor:'#ee0a0a',color:"#ededf0", padding:"0px 4px"}}> 삭제 </button>
                        </> 
                      )}
                    </div>
                  </div>
                  <div className="manager-post-inquirys-popup-line-body">
                    {response.author_type === "AM" ? (
                      <textarea className='manager-post-inquirys-popup-line-textarea' 
                      rows={2} ref={el => (textarea.current[index+1] = el)} value={response.response_content} onChange={(e)=>{handleResizeHeight(e,index)}}/> 
                    ) : (
                      <>
                        {response.response_content}
                      </>
                    )}
                  </div>
                </div>
                </div>
                ))
              )}
              <div className="manager-post-inquirys-popup-answer">
                <h6 className="manager-post-inquirys-popup-answer-h6"> 답변 </h6>
                <textarea className='manager-post-inquirys-popup-line-textarea' 
                rows={2} ref={el => (textarea.current[0] = el)} value={createContent} onChange={(e)=>{handleCreateResizeHeight(e)}}/> 
                <button className="manager-button post-btn2" onClick={()=>handleCreate()}> 작성 </button>
              </div>
              {/* postCode postType postTitle postContent authorCode authorType postContent가 넘어갔을때 문제 */}
            </div>
          </div>
        )}
        <div className='manager-post-notice-table-paging flex-align-center'>
          <button className='manager-button' onClick={()=>setPageNumber(pageNumber - 1)}
            style={{color: pageNumber === 0 ? '#aaa' : '#26319b'}}
            disabled={pageNumber === 0}
          >이전</button>
          <div className='manager-post-notice-table-paging-page'>{(pageNumber+1)} / {totalPages}</div>
          <button className='manager-button' onClick={()=>setPageNumber(pageNumber + 1)}
            style={{color: (pageNumber + 1) >= totalPages ? '#aaa' : '#26319b'}}
            disabled={ (pageNumber + 1) >= totalPages }
          >다음 </button>
        </div>
      </div>
      {loading && (
        <Loading />
      )}
    </div>
  )
}

export default PostInquirys;