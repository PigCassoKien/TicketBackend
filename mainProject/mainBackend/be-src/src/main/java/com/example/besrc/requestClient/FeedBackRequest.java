package com.example.besrc.requestClient;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedBackRequest {

    @NotNull
    @JsonProperty("filmId")
    private Long filmId;

    @NotNull
    @NotBlank
    @JsonProperty("feedback")
    private String feedback;

    @NotNull
    @Min(0)
    @Max(10)
    @JsonProperty("rating")
    private Integer rated_stars;

    public FeedBackRequest() {}

}
