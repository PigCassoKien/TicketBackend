package com.example.besrc.Service;

import com.example.besrc.Entities.Film;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.ServerResponse.FilmInformationResponse;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public interface FilmService {

    List<FilmInformationResponse> getFilms(int pageNumber, int pageSize);

    Film saveFilm(Film film);
    List<FilmInformationResponse> getFilmName(String title, int pageNumber, int pageSize);

    Object[] getFilmCategory(String category, int pageNumber, int pageSize);

    FilmInformationResponse getFilm(Long id);

    MyApiResponse removeFilm(Long id);
    Film updateFilm(Film film);
    MyApiResponse saveFilmList(List<Film> films);
}
