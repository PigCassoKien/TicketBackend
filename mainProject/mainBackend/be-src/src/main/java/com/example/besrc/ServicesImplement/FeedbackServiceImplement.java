package com.example.besrc.ServicesImplement;

import com.example.besrc.Entities.Account;
import com.example.besrc.Entities.FeedBack;
import com.example.besrc.Entities.Film;
import com.example.besrc.Exception.BadRequestException;
import com.example.besrc.Exception.NotFoundException;
import com.example.besrc.Repository.AccountRepository;
import com.example.besrc.Repository.FeedbackRepository;
import com.example.besrc.Repository.FilmRepository;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.ServerResponse.FeedBackResponse;
import com.example.besrc.Service.FeedbackService;
import com.example.besrc.requestClient.FeedBackRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class FeedbackServiceImplement implements FeedbackService {

    @Autowired
    private InputValidationServiceImplement inputValidationFilter;

    @Autowired
    private FilmRepository filmRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private AccountRepository accountRepository;

    private void removeFeedback(FeedBack feedBack) {
        Film film = feedBack.getFilm();
        film.removeFeedBack(feedBack);
        feedbackRepository.delete(feedBack);
        filmRepository.save(film);
    }

    @Override
    public FeedBackResponse addFeedBack(String username, FeedBackRequest request) {
        Account account = accountRepository.getByUsername(username).orElseThrow(()
                -> new NotFoundException("Username: " + username + " NOT FOUND"));

        Film film = filmRepository.findById(request.getFilmId()).orElseThrow(()
                -> new NotFoundException("FilmId: " + request.getFilmId() + " NOT FOUND"));

        if (feedbackRepository.existsByAccountIdAndFilmId(account.getId(), film.getId())) {
            throw new BadRequestException("Feedback đã tồn tại");
        }

        String validFeedback = inputValidationFilter.sanitizeInput(request.getFeedback());
        FeedBack feedBack = new FeedBack(film, account, request.getRated_stars(), validFeedback);
        FeedBack save = feedbackRepository.save(feedBack);
        film.addFeedBack(save);
        filmRepository.save(film);
        return new FeedBackResponse(save);
    }

    @Override
    public FeedBackResponse editFeedBack(String username, String id, @Valid FeedBackRequest request) {
        FeedBack feedBack = feedbackRepository.findById(id).orElseThrow(()
                -> new NotFoundException("Feedback ID: " + id + " NOT FOUND"));
        if (!feedBack.getAccount().getUsername().equals(username)) {
            throw new BadRequestException("Feedback ID: " + id + " không thuộc về người dùng: " + username);
        }

        String validFeedback = inputValidationFilter.sanitizeInput(request.getFeedback());
        feedBack.setFeedback(validFeedback);
        feedBack.setRated(request.getRated_stars());

        FeedBack save = feedbackRepository.save(feedBack);
        return new FeedBackResponse(save);
    }

    @Override
    public FeedBackResponse addListFeedBacks(String username, List<FeedBackRequest> requests) {
        for (FeedBackRequest request : requests) {
            this.addFeedBack(username, request);
        }
        return new FeedBackResponse();
    }

    @Override
    public MyApiResponse likeReact(String username, long matchId) {
        return null;
    }

    @Override
    public MyApiResponse dislikeReact(String username, long matchId) {
        return null;
    }

    @Override
    public MyApiResponse deleteFeedBackByUserName(String username, String id) {
        FeedBack feedBack = feedbackRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Feedback ID: " + id + " NOT FOUND"));
        if (!feedBack.getAccount().getUsername().equals(username)) {
            throw new BadRequestException("Feedback ID: " + id + " không thuộc về người dùng: " + username);
        }
        this.removeFeedback(feedBack);
        return new MyApiResponse("Xóa thành công");
    }

    @Override
    public MyApiResponse deleteFeedBackById(String feedbackId) {
        FeedBack feedBack = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new NotFoundException("Feedback ID: " + feedbackId + " NOT FOUND"));
        this.removeFeedback(feedBack);
        return new MyApiResponse("Xóa thành công");
    }

    @Override
    public FeedBackResponse getAFeedBack(String username, String feedbackId) {
        FeedBack feedBack = feedbackRepository.findById(feedbackId).orElseThrow(()
                -> new NotFoundException("Feedback ID: " + feedbackId + " NOT FOUND"));
        if (!feedBack.getAccount().getUsername().equals(username)) {
            throw new BadRequestException(username + "'s Feedback: NOT FOUND");
        }
        return new FeedBackResponse(feedBack);
    }

    @Override
    public List<FeedBackResponse> getAllFeedBacks() {
        List<FeedBack> feedBackList = feedbackRepository.findAll();
        List<FeedBackResponse> responses = new ArrayList<>();
        for (FeedBack feedBack : feedBackList) {
            responses.add(new FeedBackResponse(feedBack));
        }
        return responses;
    }

    @Override
    public List<FeedBackResponse> getAllFeedBacksFromFilmId(long filmId) {
        List<FeedBack> feedBackList = feedbackRepository.findAllByFilmId(filmId);
        List<FeedBackResponse> responses = new ArrayList<>();
        for (FeedBack feedBack : feedBackList) {
            responses.add(new FeedBackResponse(feedBack));
        }
        return responses;
    }

    @Override
    public List<FeedBackResponse> getAllFeedBacksByUserName(String username) {
        Account account = accountRepository.getByUsername(username)
                .orElseThrow(() -> new NotFoundException("Username: " + username + " NOT FOUND"));
        return this.getAllFeedBacksByAccountId(account.getId());
    }

    @Override
    public List<FeedBackResponse> getAllFeedBacksByAccountId(String accountId) {
        Account account = accountRepository.findById(accountId).orElseThrow(()
                -> new NotFoundException("Account ID: " + accountId + " NOT FOUND"));
        List<FeedBack> feedBackList = feedbackRepository.findAllByAccountId(account.getId());
        List<FeedBackResponse> responses = new ArrayList<>();
        for (FeedBack feedBack : feedBackList) {
            responses.add(new FeedBackResponse(feedBack));
        }
        return responses;
    }
}