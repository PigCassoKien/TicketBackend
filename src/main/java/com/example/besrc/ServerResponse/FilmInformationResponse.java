package com.example.besrc.ServerResponse;

import com.example.besrc.Entities.Category;
import com.example.besrc.Entities.FeedBack;
import com.example.besrc.Entities.Film;
import lombok.Getter;
import lombok.Setter;


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
    private String releaseDate;
    private String image;
    private String largeImage;
    private String trailer;
    private String mainCharacter;
    private List<Category> categories;
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
        this.mainCharacter = String.valueOf(film.getActors());
        this.largeImage = film.getLargeImage();
        this.categories = film.getCategories();
        this.feedBackResponseList = null;
    }

    public FilmInformationResponse(Long id, String title, String image, String large_image, List<Category> categories,int durationInMinutes, List<FeedBack> feedBacks) {
        this.id = id;
        this.title = title;
        this.image = image;
        this.largeImage = large_image;
        this.durationInMinutes = durationInMinutes;
        this.categories = categories;
        this.feedBackResponseList = this.convertType(feedBacks);
    }

    private List<FeedBackResponse> convertType (List<FeedBack> feedBacks) {
        List<FeedBackResponse> list = new ArrayList<>();
        for (FeedBack feedBack : feedBacks) {
            list.add(new FeedBackResponse(feedBack));
        }
        return list;
    }

}
