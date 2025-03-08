package com.example.besrc.ServicesImplement;

import com.example.besrc.Entities.Category;
import com.example.besrc.Entities.Film;
import com.example.besrc.Exception.BadRequestException;
import com.example.besrc.Exception.NotFoundException;
import com.example.besrc.Repository.CategoryRepository;
import com.example.besrc.Repository.FilmRepository;
import com.example.besrc.Security.InputValidationFilter;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.ServerResponse.FilmInformationResponse;
import com.example.besrc.Service.FilmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class FilmServiceImplement implements FilmService {

    @Autowired
    private FilmRepository filmRepository;

    @Autowired
    private InputValidationFilter inputValidationFilter;

    @Autowired
    private CategoryRepository categoryRepository;
    @Override
    public List<FilmInformationResponse> getFilms(int pageNumber, int pageSize) {
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        List<Film> films = filmRepository.findAll(pageable).getContent();
        List<FilmInformationResponse> responses = new ArrayList<>();
        for (Film film : films) {
            responses.add(new FilmInformationResponse(film));
        }
        return responses;
    }

    @Override
    public Film saveFilm(Film film) {
         if (filmRepository.existsByTitle(film.getTitle())) {
             throw new BadRequestException("Film name already exists");
         }
        return filmRepository.save(film);
    }

    @Override
    public List<FilmInformationResponse> getFilmName(String title, int pageNumber, int pageSize) {
        String keyWord = inputValidationFilter.sanitizeInput(title);
        System.out.println("Sanitized input: " + keyWord); // Debug input
        if (inputValidationFilter.checkInput(keyWord)) {
            throw new BadRequestException("Invalid input");
        }

        Pageable pages = PageRequest.of(pageNumber, pageSize);
        if (keyWord.isEmpty()) {
            throw new BadRequestException("Invalid input: Empty keyword is not allowed.");
        }
        List<Film> films = filmRepository.findByTitleContaining(keyWord, pages);
        List<FilmInformationResponse> responses = new ArrayList<>();
        for (Film film : films) {
            responses.add(new FilmInformationResponse(film));
        }
        return responses;
    }

    @Override
    public Object[] getFilmCategory(String category, int pageNumber, int pageSize) {
        String keyWord = inputValidationFilter.sanitizeInput(category);
        if (inputValidationFilter.checkInput(keyWord)) {
            throw new BadRequestException("Invalid input");
        }
        List<Category> categories = categoryRepository.findByCategoryNameContaining(keyWord);
        if (categories.isEmpty()) {
            return new Object[0];
        }

        List<FilmInformationResponse> responses = new ArrayList<>();
        for (Category category1 : categories) {
            for (Film film : category1.getFilmList()) {
                responses.add(new FilmInformationResponse(film));
            }
        }
        Set<FilmInformationResponse> filmSet = new HashSet<>(responses);
        return filmSet.toArray(new FilmInformationResponse[0]);
    }

    @Override
    public FilmInformationResponse getFilm(Long id) {
        Film film = filmRepository.findById(id).orElseThrow(
                () -> new NotFoundException("Film ID: " + id + " NOT FOUND")
        );
        return new FilmInformationResponse(film);
    }

    @Override
    public MyApiResponse removeFilm(Long id) {
        filmRepository.findById(id).orElseThrow(()
            -> new NotFoundException("Film ID: " + id + " NOT FOUND"));
        filmRepository.deleteById(id);
        return new MyApiResponse("Remove successfully");
    }

    @Override
    public Film updateFilm(Film film) {
        return filmRepository.save(film);
    }

    @Override
    public MyApiResponse saveFilmList(List<Film> films) {
        for (Film film : films) {
            if (filmRepository.existsByTitle(film.getTitle())) {
                continue;
            }

            Set<String> categorySet = new HashSet<>();
            for (Category category : film.getCategories()) {
                categorySet.add(category.getCategoryName());
            }
            if (categorySet.size() != film.getCategories().size()) {
                throw new BadRequestException("Category name duplicate");
            }
            film.setCategories(new ArrayList<>());
            for (String category : categorySet) {
                Category category1 = categoryRepository.findByCategoryName(category);
                if (category1 == null) {
                    category1 = new Category();
                    category1.setCategoryName(category);
                    categoryRepository.save(category1);
                }
                film.getCategories().add(category1);
            }
            filmRepository.save(film);
        }
        return new MyApiResponse("Save successfully");
    }
}
