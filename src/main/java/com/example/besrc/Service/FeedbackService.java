package com.example.besrc.Service;

import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.ServerResponse.FeedBackResponse;
import com.example.besrc.requestClient.FeedBackRequest;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public interface FeedbackService {
    public FeedBackResponse addFeedBack(String username, FeedBackRequest request);
    public FeedBackResponse editFeedBack(String username, String id, @Valid FeedBackRequest request);
    public FeedBackResponse addListFeedBacks(String username, List<FeedBackRequest> requests);

    public MyApiResponse likeReact(String username, long matchId);
    public MyApiResponse dislikeReact(String username, long matchId);

    public MyApiResponse deleteFeedBackByUserName(String username, String id);
    public MyApiResponse deleteFeedBackById (String feedbackId);

    public FeedBackResponse getAFeedBack(String username, String feedbackId);
    public List<FeedBackResponse> getAllFeedBacks();
    public List<FeedBackResponse> getAllFeedBacksFromFilmId(long filmId);
    public List<FeedBackResponse> getAllFeedBacksByUserName(String username);
    public List<FeedBackResponse> getAllFeedBacksByAccountId(String accountId);
}
