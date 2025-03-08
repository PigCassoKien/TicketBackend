package com.example.besrc.requestClient;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class FeedBackRequest {

    @NotNull
    @JsonProperty("filmId")
    private Long filmId;

    @NotNull
    @NotBlank
    @JsonProperty("feedback")
    private String feedback;

    @NotNull
    @NotBlank
    @JsonProperty("rating")
    private int rated_stars;

    public FeedBackRequest() {}

    public Long getFilmId() {
        return filmId;
    }

    public void setFilmId(@NotNull Long filmId) {
        this.filmId = filmId;
    }

    public @NotNull @NotBlank String getFeedback() {
        return feedback;
    }

    public void setFeedback(@NotNull @NotBlank String feedback) {
        this.feedback = feedback;
    }

    @NotNull
    @NotBlank
    public int getRated_stars() {
        return rated_stars;
    }

    public void setRated_stars(@NotNull @NotBlank int rated_stars) {
        this.rated_stars = rated_stars;
    }
}
