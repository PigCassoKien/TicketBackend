package com.example.besrc.requestClient;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class ShowRequest {

    @NotBlank
    @JsonProperty(value = "hallId")
    private String hallId;

    @NotBlank
    @JsonProperty(value = "filmId")
    private String filmId;


    @NotNull
    @JsonProperty(value = "startingTime")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    private LocalDateTime startingTime;


}
