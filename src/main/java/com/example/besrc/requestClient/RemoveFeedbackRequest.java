package com.example.besrc.requestClient;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class RemoveFeedbackRequest {

    @NotNull
    @NotBlank
    private String feedback;

    public @NotNull @NotBlank String getFeedback() {
        return feedback;
    }

    public void setFeedback(@NotNull @NotBlank String feedback) {
        this.feedback = feedback;
    }
}
