import { Link, useNavigate, useParams } from "react-router-dom";
import "./Inquirys.css";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { store } from '../../redux/store';



const Inquirys = () => {
  const params = useParams().postId;
  const [inquirys, setInquirys] = useState();
  const [responses, setResponses] = useState();
  const [postCode, setPostCode] = useState();
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [authorCode, setAuthorCode] = useState();
  const [crystalCode, setCrystalCode] = useState();
  const [addResponses, setAddResponses] = useState(false);
  const navigate = useNavigate();

  // postTitle postContent authorCode
  
  const detailInquirys = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/user/customers/inquirys/${params}`);
      
      if (response.data) {
        setInquirys(response.data);
        setCrystalCode(response.data.author_code);
        setPostCode(response.data.post_code);
      }
    } catch (error) {
      console.error('There was an error fetching the movies!', error);
    }
  }

  const detailResponses = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/user/customers/responses/${params}`);
      
      if (response.data) {
        setResponses(response.data);
      }
    } catch (error) {
      console.error('There was an error fetching the movies!', error);
    }
  }

  const createInquiry = async (newPost) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/arentcar/user/customers/inquirys`,
        newPost
      );
    } catch (error) {
      console.error('There was an error fetching the movies!', error);
    }
  }

  const createResponses   = async (newPost) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/arentcar/user/customers/responses`,
        newPost
      );
    } catch (error) {
      console.error('There was an error fetching the movies!', error);
    }
  }

  useEffect(()=>{
    if(params) { detailInquirys(); detailResponses(); }
    else { isLogin(); }
    setAuthorCode(store.getState().userState.userCode);
  },[params])

  const isLogin = () => {
    let loginState = store.getState().userState.loginState;
    if(!loginState) { alert("로그인이 필요합니다."); navigate('/login', {state : "/customers/IQ"}) }
    return loginState;
  }

  
  const handleCreate = () => {
    if(postContent === "" || postTitle === "") {
      alert("후기를 적성해주세요.")
      return ;
    }

    const newPost = {
      post_code: null,
      post_type: null,
      post_title: postTitle,
      post_content: postContent,
      author_code: authorCode,
      author_type: null,
      author: null,
      created_at: null,
      updated_at: null,
      inquiry_status: null,
    }

    createInquiry(newPost);
    alert("문의를 작성했습니다.");

    navigate("/customers");
  }

  const textarea = useRef();
  const handleResizeHeight = (e,set) => {
    set(e.target.value);
    // setPostContent(e.target.value);
    textarea.current.style.height = "auto";
    textarea.current.style.height = textarea.current.scrollHeight + "px";
  }

  const handleAddResponses = () => {
    if(!addResponses) {
      setAddResponses(true);
    } else if(window.confirm('문의를 추가하시겠습니까?')) {
      if(postContent === "") {
        alert("문의 내용을 적성해주세요.")
        return ;
      }
      const newResponses = {
        response_content:null,
        post_code: postCode,
        response_content: postContent,
        author_code: authorCode,
        author_type: null,
        author: null,
        created_at: null,
        updated_at: null,
      }
      setAddResponses(false);
      createResponses(newResponses).then(function () {
        if(params) { detailInquirys(); detailResponses(); } 
      }, function () {
        //실패했을 때 실행
        alert("추가에 실패했습니다.")
      });
    }
  }

  return(
    <div className="user-customers-inquirys">
      <div className="user-customers-header">
        <h3 className="user-customers-header-h3">
          고객문의
        </h3>
      </div>
      <div className="user-customers-wrap">
      {params ? (
           <>
            <div className="user-customers-detail-inquirys">
              <div className="user-customers-detail-inquirys-header">
                <div className="user-customers-detail-inquirys-title">
                  <h4>
                    {inquirys && (<>
                      {inquirys.post_title}
                    </>)}
                  </h4>
                  
                </div>
                <div className="user-customers-detail-inquirys-author">
                  <div>
                    {inquirys && (<>
                      {inquirys.author}
                    </>)}
                  </div>
                  <div>
                    {inquirys && (<>
                      {inquirys.created_at}
                    </>)}
                  </div>
                </div>
              </div>
              <hr/>
              <div className="user-customers-detail-inquirys-content">
                {inquirys && (<>
                  {inquirys.post_content}
                </>)}
              </div>
            </div>
            {responses && responses.map((response, index)=>(
              <div key={index} className="user-customers-detail-responses">
                <hr/>
                <div className="user-customers-detail-responses-header">
                  <h5> {response.author_type === "AM" && (<>관리자 : </>)} {response.author}</h5>
                  <div className="user-customers-detail-responses-header-day"> {response.created_at} </div>
                </div>
                <div className="user-customers-detail-responses-body">
                  {response.response_content}
                </div>
              </div>
            ))}
            {addResponses && (
            <div className="user-customers-add-responses">
              <h6> 추가 문의 </h6> 
              <textarea className="user-customers-create-inquirys-popup-content"
              rows={2} ref={textarea} onChange={(e)=>{handleResizeHeight(e,setPostContent)}}/> 
            </div>
            )}

          </>
        ) : ( 
          <div className="user-customers-create-inquiryss">
            <div className="user-customers-create-inquirys-popup-wrap">
              <div className="user-customers-create-inquirys-popup-line">
                <div className="user-customers-create-inquirys-popup-title"> <h4> 문의 작성 </h4> </div>
              </div>
              <div className="user-customers-create-inquirys-popup-line">
                <h6 className="user-customers-create-inquirys-popup-line-title">제목</h6> 
                <textarea className="width400 user-customers-create-inquirys-popup-content"
                rows={1} ref={textarea} onChange={(e)=>{handleResizeHeight(e,setPostTitle)}}/> 
              </div>
              <br/>
              <div className="user-customers-create-inquirys-popup-line">
                <h6 className="user-customers-create-inquirys-popup-line-title">내용</h6>
                <textarea className="width400 user-customers-create-inquirys-popup-content"
                rows={10} ref={textarea} onChange={(e)=>{handleResizeHeight(e,setPostContent)}}/>
              </div>
              <div className="user-customers-create-inquirys-popup-line">
                {/* <button className="user-customers-create-inquirys-popup-button" onClick={()=>{}}>작성</button>  */}
                {/* <button className="manager-button" onClick={()=>handleColse()}>닫기</button> */}
              </div>
            </div>
          </div>
        )}

        <div className="user-customers-list">
            {/* + state={{ postState: dtataInfo }} */}
          <Link to={"/customers"} state={{ postState: 2 }} className="user-customers-list-button">리스트</Link>
          {!params && 
            (<button className="user-customers-create-inquirys-popup-button" onClick={()=>handleCreate()}>작성</button>)}
          {authorCode === crystalCode && 
            ( <button className="user-customers-create-inquirys-popup-button" onClick={()=>{handleAddResponses()}}> 추가 </button> )}
        </div>
      </div>
    </div>
  )
}

export default Inquirys;