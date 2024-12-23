package com.apple.arentcar.mapper;

import com.apple.arentcar.model.*;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PostsMapper {
    List<Notices> getPostsAll();
    List<Notices> getAllNotices(Integer pageSize, Integer pageNumber);
    int countAllNotices();
    List<Notices> getsSearchNotices(String keyword, Integer pageSize, Integer pageNumber);
    int countSearchNotices(String keyword);
    Notices getNotice(Integer postCode);
    void createNotice(Notices notice);
    void updateNotice(Notices notice);
    void deleteNotice(Integer postCode);

    List<Reviews> getAllReviews(Integer pageSize, Integer pageNumber);
    int countReviews();
    List<Reviews> getSearchAllReviews(String keyword, Integer pageSize, Integer pageNumber);
    int countSearchReviews(String keyword);
    Reviews getReview(Integer postCode);
    void createReviewPosts(Reviews reviews);
    void createReview(Reviews reviews);
    void updateReviewContent(Reviews reviews);
    void updateReviewScore(Reviews reviews);
    void deleteReview(Integer postCode);
    void deletePostsRV(Integer postCode);
    List<ChartsAvg> dayChartsAvg();
    List<ChartsCount> dayChartsCount();
    List<ChartsAvg> ageChartsAvg();
    List<ChartsCount> ageChartsCount();

    List<Inquirys> getAllInquirys(Integer pageSize, Integer pageNumber);
    int countInquirys();
    List<Inquirys> getSearchAllInquirys(String keyword, Integer pageSize, Integer pageNumber);
    int countSearchInquirys(String keyword);
    Inquirys getInquirys(Integer postCode);
    void deleteInquirysPS(Integer postCode);
    void deleteInquirysIQ(Integer postCode);
    void deleteInquirysRS(Integer postCode);
    List<Responses> getResponses(Integer postCode);
    void createResponses(Responses responses);
    void updateResponses(Responses responses);
    void updateInquiryStatus(Responses responses);
    void deleteResponses(Integer responseCode);
    void createInquiryPosts(Inquirys inquiry);
    void createInquiry(Inquirys inquiry);
    void createUserResponses(Responses responses);
}
