package com.example.besrc.ServerResponse;

import com.example.besrc.Entities.FeedBack;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class FeedBackResponse {
    private String feedBackId;
    private String username;
    private String comment;
    private long matchId;
    private int like;
    private int dislike;
    private int starsRate;
    private String updateAt;

    public FeedBackResponse() {
        this.feedBackId = "";
        this.username = "";
        this.comment = "";
        this.matchId = 0;
        this.like = 0;
        this.dislike = 0;
        this.starsRate = 0;
        this.updateAt = "";
    }

    public FeedBackResponse(FeedBack feedBack) {
        this.feedBackId = feedBack.getId();
        this.username = feedBack.getAccount().getUsername();
        this.comment = feedBack.getFeedback();
        this.matchId = feedBack.getFilm().getId();
        this.like = feedBack.getLiked();
        this.dislike = feedBack.getDisliked();
        this.starsRate = feedBack.getRated();
        this.updateAt = feedBack.getUpdate_at().toString();
    }

}
