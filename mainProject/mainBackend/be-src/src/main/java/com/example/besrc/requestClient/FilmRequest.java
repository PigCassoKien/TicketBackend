// FilmRequest.java
package com.example.besrc.requestClient;

import com.example.besrc.Entities.EnumEntities.FilmStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Setter
@Getter
public class FilmRequest {

    // Getters and Setters
    @JsonProperty("title")
    private String title;

    @JsonProperty("description")
    private String description;

    @JsonProperty("durationInMinutes")
    private int durationInMinutes;

    @JsonProperty("language")
    private String language;

    @JsonProperty("releaseDate")
    private String releaseDate;

    @JsonProperty("country")
    private String country;

    @JsonProperty("categories")
    private List<String> categories;

    private MultipartFile image; // Changed to MultipartFile

    private MultipartFile largeImage; // Changed to MultipartFile

    @JsonProperty("trailer")
    private String trailer;

    @JsonProperty("actors")
    private List<String> actors;

    @JsonProperty("status")
    private FilmStatus status;

}