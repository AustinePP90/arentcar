package com.apple.arentcar.controller;

import com.apple.arentcar.model.Inquirys;
import com.apple.arentcar.model.Notices;
import com.apple.arentcar.model.Reviews;
import com.apple.arentcar.service.PostsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/arentcar")
public class PostsController {

    @Autowired
    PostsService postsService;

    @GetMapping("/user/customers/notices")
    public ResponseEntity<List<Notices>> getUserAllNotices(
            @RequestParam int pageSize,
            @RequestParam int pageNumber,
            @RequestParam(required = false) String postName ){
        List<Notices> notices;
        if(postName != null && !postName.isEmpty()){
            notices = postsService.getSearchNotices(postName, pageSize, pageNumber);
        } else {
            notices = postsService.getAllNotices(pageSize, pageNumber);
        }
        return ResponseEntity.ok(notices);
    }
    @GetMapping("/user/customers/notices/count")
    public ResponseEntity<Integer> getUserNoticesCount( @RequestParam(required = false) String postName ){
        int count;
        if(postName != null && !postName.isEmpty()){
            count = postsService.countSearchNotices(postName);
        } else {
            count = postsService.countAllNotices();
        }
        return ResponseEntity.ok(count);
    }
    @GetMapping("/user/customers/notices/{postCode}")
    public ResponseEntity<Notices> getUserNotice(@PathVariable Integer postCode) {
        Notices notices = postsService.getNotice(postCode);

        if (notices != null) {
            return ResponseEntity.ok(notices);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/customers/reviews")
    public ResponseEntity<List<Reviews>> getUserAllReviews(
            @RequestParam int pageSize,
            @RequestParam int pageNumber,
            @RequestParam(required = false) String postName) {
        List<Reviews> reviews;
        if(postName != null && !postName.isEmpty()) {
            reviews = postsService.getSearchAllReviews(postName, pageSize, pageNumber);
        } else {
            reviews = postsService.getAllReviews(pageSize, pageNumber);
        }
        return ResponseEntity.ok(reviews);
    }
    @GetMapping("/user/customers/reviews/count")
    public ResponseEntity<Integer> getUserReviewsCount( @RequestParam(required = false) String postName ){
        int count;
        if(postName != null && !postName.isEmpty()){
            count = postsService.countSearchReviews(postName);
        } else {
            count = postsService.countReviews();
        }
        return ResponseEntity.ok(count);
    }

    @GetMapping("/manager/post")
    public List<Notices> getPostsAll(){ return postsService.getPostsAll(); }

    @GetMapping("/manager/post/notices")
    public ResponseEntity<List<Notices>> getAllNotices(
            @RequestParam int pageSize,
            @RequestParam int pageNumber,
            @RequestParam(required = false) String postName ){
        List<Notices> notices;
        if(postName != null && !postName.isEmpty()){
            notices = postsService.getSearchNotices(postName, pageSize, pageNumber);
        } else {
            notices = postsService.getAllNotices(pageSize, pageNumber);
        }
        return ResponseEntity.ok(notices);
    }

    @GetMapping("/manager/post/notices/{postCode}")
    public ResponseEntity<Notices> getNotice(@PathVariable Integer postCode) {
        Notices notices = postsService.getNotice(postCode);

        if (notices != null) {
            return ResponseEntity.ok(notices);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/manager/post/notices/count")
    public ResponseEntity<Integer> getNoticesCount( @RequestParam(required = false) String postName ){
        int count;
        if(postName != null && !postName.isEmpty()){
            count = postsService.countSearchNotices(postName);
        } else {
            count = postsService.countAllNotices();
        }
        return ResponseEntity.ok(count);
    }

    @PostMapping("/manager/post/notices")
    public ResponseEntity<Notices> createNotice(@RequestBody Notices notices) {
        System.out.println(notices.getPostTitle());
        System.out.println(notices.getPostContent());
        System.out.println(notices.getAuthorCode());

        postsService.createNotices(notices);
        return ResponseEntity.ok(notices);
    }

    @PutMapping("/manager/post/notices/{postCode}")
    public ResponseEntity<Notices> updateNotice(
            @RequestBody Notices notices,
            @PathVariable Integer postCode){
        notices.setPostCode(postCode);

        postsService.updateNotice(notices);
        return ResponseEntity.ok(notices);
    }

    @DeleteMapping("/manager/post/notices/{postCode}")
    public ResponseEntity<Notices> deleteNotice(@PathVariable Integer postCode) {
        postsService.deleteNotice(postCode);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/manager/post/reviews")
    public ResponseEntity<List<Reviews>> getAllReviews(
            @RequestParam int pageSize,
            @RequestParam int pageNumber,
            @RequestParam(required = false) String postName) {
        List<Reviews> reviews;
        if(postName != null && !postName.isEmpty()) {
            reviews = postsService.getSearchAllReviews(postName, pageSize, pageNumber);
        } else {
            reviews = postsService.getAllReviews(pageSize, pageNumber);
        }
        return ResponseEntity.ok(reviews);
    }
    @GetMapping("/manager/post/reviews/count")
    public ResponseEntity<Integer> getReviewsCount( @RequestParam(required = false) String postName ){
        int count;
        if(postName != null && !postName.isEmpty()){
            count = postsService.countSearchReviews(postName);
        } else {
            count = postsService.countReviews();
        }
        return ResponseEntity.ok(count);
    }
    @GetMapping("/manager/post/reviews/{postCode}")
    public ResponseEntity<Reviews> getReview(@PathVariable Integer postCode) {
        Reviews review = postsService.getReview(postCode);

        if (review != null) {
            return ResponseEntity.ok(review);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    @PostMapping("/manager/post/reviews")
    public ResponseEntity<Reviews> createReview(@RequestBody Reviews reviews) {
        postsService.createReview(reviews);

        return ResponseEntity.ok(reviews);
    }
    @DeleteMapping("/manager/post/reviews/{postCode}")
    public ResponseEntity<Reviews> deleteReview(@PathVariable Integer postCode) {
        postsService.deleteReview(postCode);
        return ResponseEntity.noContent().build();
    }



    @GetMapping("/manager/post/inquirys")
    public List<Inquirys> getAllInquirys(){ return postsService.getAllInquirys(); }

}