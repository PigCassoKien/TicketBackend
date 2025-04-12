package com.example.besrc.requestClient;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class EditFeedbackRequest {

    @NotNull
    @NotBlank
    @JsonProperty("feedback")
    private String feedback;

    @NotNull
    @JsonProperty("rating")
    private int rating_stars;
    public EditFeedbackRequest() {}

    @NotNull
    public int getRating_stars() {
        return rating_stars;
    }

    public void setRating_stars(@NotNull int rating_stars) {
        this.rating_stars = rating_stars;
    }

    public @NotNull @NotBlank String getFeedback() {
        return feedback;
    }

    public void setFeedback(@NotNull @NotBlank String feedback) {
        this.feedback = feedback;
    }
}
