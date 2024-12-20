import { Link, useNavigate, useParams } from "react-router-dom";
import "./Reviews.css"
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { store } from '../../redux/store';
import Loading from 'common/Loading';

const Reviews = () => {
  const [reviews, setReviews] = useState();
  const params = useParams().postId;
  // const [loginState, setLoginState] = useState(true);
  const [score, setScore] = useState(0);
  const [postContent,setPostContent] = useState("");
  const [authorCode,setAuthorCode] = useState();
  const [authorName,setAuthorName] = useState();
  const [crystalCode, setCrystalCode] = useState();
  const [updateState, setUpdateState] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);


  const detailReviews = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/user/customers/reviews/${params}`);
      
      if (response.data) {
        setReviews(response.data);
        setCrystalCode(response.data.author_code)
      }
    } catch (error) {
      console.error('There was an error fetching the movies!', error);
    } 
  }

  const createReview = async (newPost) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/arentcar/user/customers/reviews`,
        newPost
      );

    } catch (error) {
      console.error('There was an error fetching the movies!', error);
    }
  }

  const updateReview = async (newPost) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/arentcar/user/customers/reviews`,
        newPost
      );

    } catch (error) {
      console.error('There was an error fetching the movies!', error);
    }
  }

  const deleteReview = async () => {
    try {
      const response = await axios.delete(`${process.env.REACT_APP_API_URL}/arentcar/user/customers/reviews/${params}`);

    } catch (error) {
      console.error('There was an error fetching the movies!', error);
    }
  }

  useEffect(()=>{
    if(params) { detailReviews(); }
    else { isLogin(); }
    setAuthorName(store.getState().userState.userName)
    setAuthorCode(store.getState().userState.userCode)
  },[params])

  const isLogin = () => {
    let loginState = store.getState().userState.loginState;
    if(!loginState) { alert("로그인이 필요합니다."); navigate('/login', {state : "/customers/RV"}) }
    return loginState;
  }

  const textarea = useRef();
  const handleResizeHeight = (e) => {
    setPostContent(e.target.value);
    textarea.current.style.height = "auto";
    textarea.current.style.height = textarea.current.scrollHeight + "px";
  }

  const StarSeting = () => {
    const star = [];

    for (let index = 0; index < score; index++) {
      star.push("★");
    }
    for (let index = 0; index < 5 - score; index++) {
      star.push("☆");
    }
    return (<>
      <span onClick={ ()=>setScore(1) } > {star[0]} </span>
      <span onClick={ ()=>setScore(2) } > {star[1]} </span>
      <span onClick={ ()=>setScore(3) } > {star[2]} </span>
      <span onClick={ ()=>setScore(4) } > {star[3]} </span>
      <span onClick={ ()=>setScore(5) } > {star[4]} </span>
    </>)
  }

  const scoreSeting = (star) => {
    const scoreStar = [];
    for (let index = 0; index < star; index++) {
      scoreStar.push("★");
    }
    for (let index = 0; index < 5 - star; index++) {
      scoreStar.push("☆");
    }
    return <> {scoreStar} </>
  }

  const handleCreate = () => {
    if(score === 0 || postContent === "") {
      alert("후기를 적성해주세요.")
      return ;
    }

    const newPost = {
      post_code: null,
      post_type: null,
      post_title: authorName+"님 후기",
      post_content: postContent,
      author_code: authorCode,
      author_type: null,
      author: null,
      created_at: null,
      updated_at: null,
      review_rating: score,
    }

    createReview(newPost);
    alert("후기를 남겨주셔서 감사합니다.");

    navigate('/customers', {state : { postState: 1 }})
  }
  
  const handleUpdate = () => {
    if(updateState === false) {
      setScore(reviews.review_rating);
      setPostContent(reviews.post_content);
      setUpdateState(!updateState);
    } else {
      // if(reviews.review_rating === score || reviews.post_content === postContent) {}

      if( postContent === "" ) {
        if (window.confirm('후기를 정말로 삭제하시겠습니까?')) {
          setLoading(true);
          deleteReview().then(()=>{
            alert("삭제되었습니다.");
            setLoading(false);
            navigate('/customers', {state : { postState: 1 }})
          },()=>{
            alert("삭제의 실패하였습니다.");
            setLoading(false);
          })
        }
      } else {
        const newPost = {
          post_code: params,
          post_type: null,
          post_title: authorName+"님 후기",
          post_content: postContent,
          author_code: authorCode,
          author_type: null,
          author: null,
          created_at: null,
          updated_at: null,
          review_rating: score,
        }

        setLoading(true);
        updateReview(newPost).then(()=>{
          detailReviews();
          alert("수정되었습니다.");
          setUpdateState(!updateState);
          setLoading(false);
        }, ()=>{
          setLoading(false);
        });

      }
    }
  }
  
  return(
    <div className="user-customers-reviews">
      <div className="user-customers-header">
        <h3 className="user-customers-header-h3">
          고객후기
        </h3>
      </div>
      <div className="user-customers-wrap">
        {params ? (
          <div className="user-customers-detail-reviews">
            <div className="user-customers-detail-reviews-header">
              <div className="user-customers-detail-reviews-title">
                <h4>
                  {reviews && (<>
                    {reviews.post_title} 
                    <span style={{color:"#ee0a0a"}}> 
                      {updateState ? <>
                        ( {StarSeting()} )
                      </> : <>
                        {scoreSeting(reviews.review_rating)} 
                      </>}

                    </span>
                  </>)}
                </h4>
                
              </div>
              <div className="user-customers-detail-reviews-author">
                <div>
                  {reviews && (<>
                    {reviews.author}
                  </>)}
                </div>
                <div>
                  {reviews && (<>
                    {reviews.created_at}
                  </>)}
                </div>
              </div>
            </div>
            <hr/>
            <div className="user-customers-detail-reviews-content">
              {updateState ? <>
                <textarea className="width400 user-customers-create-review-popup-content"
                rows={11} ref={textarea} value={postContent} onChange={(e)=>{handleResizeHeight(e)}}/>
              </> : <>
                {reviews && (<>
                  {reviews.post_content}
                </>)}
              </> }


            </div>
          </div>
        ) : (
          <div className="user-customers-create-reviews">
            <div className="user-customers-create-review-popup-wrap">
              <div className="user-customers-create-review-popup-line">
                <div className="user-customers-create-review-popup-title"> <h6> {authorName}님 후기</h6> </div>
              </div>
              <div className="user-customers-create-review-popup-line">
                <div className="user-customers-create-review-popup-score">
                  {/* ★☆☆☆☆ */}
                  {StarSeting()}
                </div>
              </div>
              <div className="user-customers-create-review-popup-line">
                <textarea className="width400 user-customers-create-review-popup-content"
                rows={15} ref={textarea} onChange={(e)=>{handleResizeHeight(e)}}/>
              </div>
              <div className="user-customers-create-review-popup-line">
                {/* <button className="user-customers-create-review-popup-button" onClick={()=>handleCreate()}>작성</button>  */}
                {/* <button className="manager-button" onClick={()=>handleColse()}>닫기</button> */}
              </div>
            </div>
          </div>
        )}
        <div className="user-customers-list">
            {/* + state={{ postState: dtataInfo }} */}
            <Link to={"/customers"} state={{ postState: 1 }} className="user-customers-list-button">목록보기</Link> 
            {!params && (<button className="user-customers-create-review-popup-button" onClick={()=>handleCreate()}>작성</button> )} 
            {authorCode === crystalCode && 
            (<button className="user-customers-create-review-popup-button" onClick={()=>handleUpdate()}>수정</button>)}
        </div>
      </div>
      {loading && (
        <Loading />
      )}
    </div>
  )
}

export default Reviews;