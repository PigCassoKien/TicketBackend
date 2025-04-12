package com.example.besrc.ServerResponse;

import com.example.besrc.Entities.EnumEntities.FilmStatus;
import com.example.besrc.Entities.FeedBack;
import com.example.besrc.Entities.Film;
import lombok.Getter;
import lombok.Setter;


import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
public class FilmInformationResponse {
    private long id;
    private String title;
    private String description;
    private int durationInMinutes;
    private String language;
    private String country;
    private LocalDate releaseDate;
    private String image;
    private String largeImage;
    private String trailer;
    private FilmStatus status;
    private List<String> actors;
    private List<String> categories;
    private List<FeedBackResponse> feedBackResponseList;

    public FilmInformationResponse(Film film) {
        this.id = film.getId();
        this.title = film.getTitle();
        this.description = film.getDescription();
        this.language = film.getLanguage();
        this.country = film.getCountry();
        this.releaseDate = film.getReleaseDate();
        this.image = film.getImage();
        this.trailer = film.getTrailer();
        this.actors = film.getActors();
        this.largeImage = film.getLargeImage();
        this.categories = film.getCategories();
        this.durationInMinutes = film.getDurationInMins();
        this.feedBackResponseList = convertType(film.getFeedBacks());
        this.status = film.getStatus();
    }

    public FilmInformationResponse(Long id, String title, String description, int durationInMinutes, String language,
                                   LocalDate releaseDate, String country, List<String> categories, String image,
                                   String largeImage, String trailer, List<String> actors, FilmStatus status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.durationInMinutes = durationInMinutes;
        this.language = language;
        this.releaseDate = releaseDate;
        this.country = country;
        this.categories = categories;
        this.image = image;
        this.largeImage = largeImage;
        this.trailer = trailer;
        this.actors = actors;
        this.status = status;
    }

    private List<FeedBackResponse> convertType (List<FeedBack> feedBacks) {
        List<FeedBackResponse> list = new ArrayList<>();
        for (FeedBack feedBack : feedBacks) {
            list.add(new FeedBackResponse(feedBack));
        }
        return list;
    }

}
