// FilmService.java
package com.example.besrc.Service;

import com.example.besrc.Entities.EnumEntities.FilmStatus;
import com.example.besrc.Entities.Film;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.ServerResponse.FilmInformationResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface FilmService {

    List<FilmInformationResponse> getFilms(int pageNumber, int pageSize);

    Film saveFilm(Film film, MultipartFile image, MultipartFile largeImage) throws IOException;

    MyApiResponse saveFilmList(List<Film> films);

    List<FilmInformationResponse> getFilmName(String title, int pageNumber, int pageSize);

    List<FilmInformationResponse> getFilmCategory(String category, int pageNumber, int pageSize);

    FilmInformationResponse getFilm(Long id);

    MyApiResponse removeFilm(Long id);

    Film updateFilm(Film film, MultipartFile image, MultipartFile largeImage) throws IOException;

    List<FilmInformationResponse> getFilmsByStatus(FilmStatus status);

    List<FilmInformationResponse> searchFilmsByTitlePrefix(String prefix, int pageNumber, int pageSize);
}