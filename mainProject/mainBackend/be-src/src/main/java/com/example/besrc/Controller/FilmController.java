package com.example.besrc.Controller;

import com.example.besrc.Entities.EnumEntities.FilmStatus;
import com.example.besrc.Entities.Film;
import com.example.besrc.ServerResponse.ErrorResponse;
import com.example.besrc.ServerResponse.FilmInformationResponse;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.Service.FilmService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/film")
@Tag(name = "Film")
public class FilmController {

    @Autowired
    private FilmService filmService;

    @GetMapping("/getFilms")
    @Operation(summary = "Get all films", responses = {
            @ApiResponse(responseCode = "200", description = "Get all films successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = FilmInformationResponse.class))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<FilmInformationResponse>> getFilms(
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "10000") @Valid Integer pageSize) {
        return new ResponseEntity<>(filmService.getFilms(pageNumber, pageSize), HttpStatus.OK);
    }

    @GetMapping("/getFilmName")
    @Operation(summary = "Get film by name", responses = {
            @ApiResponse(responseCode = "200", description = "Get film Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = FilmInformationResponse.class))),
            @ApiResponse(responseCode = "404", description = "Film is not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<FilmInformationResponse>> getFilmName(
            @RequestParam @Valid String keyWord,
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "50") @Valid Integer pageSize) {
        return new ResponseEntity<>(filmService.getFilmName(keyWord, pageNumber, pageSize), HttpStatus.OK);
    }

    @GetMapping("/getFilm/{filmId}")
    @Operation(summary = "Get film by filmId", responses = {
            @ApiResponse(responseCode = "200", description = "Get film Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = FilmInformationResponse.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Film is not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    public FilmInformationResponse getFilm(@Valid @PathVariable(value = "filmId") Long filmId) {
        return filmService.getFilm(filmId);
    }

    @GetMapping("/getFilmCategory")
    @Operation(summary = "Get film by category", responses = {
            @ApiResponse(responseCode = "200", description = "Get film Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = FilmInformationResponse.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Category is not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> getFilmCategory(
            @RequestParam @Valid String keyWord,
            @RequestParam(defaultValue = "0") @Valid Integer pageNumber,
            @RequestParam(defaultValue = "50") @Valid Integer pageSize) {
        return new ResponseEntity<>(filmService.getFilmCategory(keyWord, pageNumber, pageSize), HttpStatus.OK);
    }

    @PostMapping(value = "/addFilm", consumes = "multipart/form-data")
    @Operation(summary = "Add a film", responses = {
            @ApiResponse(responseCode = "200", description = "Add film successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Film.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<Film> addFilm(
            @RequestPart("title") String title,
            @RequestPart("description") String description,
            @RequestPart("durationInMins") String durationInMins,
            @RequestPart("language") String language,
            @RequestPart("releaseDate") String releaseDate,
            @RequestPart("country") String country,
            @RequestPart("categories") String categories,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "largeImage", required = false) MultipartFile largeImage,
            @RequestPart("trailer") String trailer,
            @RequestPart("actors") String actors) throws Exception {
        Film film = new Film();
        film.setTitle(title);
        film.setDescription(description);
        film.setDurationInMins(Integer.parseInt(durationInMins));
        film.setLanguage(language);
        film.setReleaseDate(LocalDate.parse(releaseDate, DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        film.setCountry(country);
        film.setCategories(List.of(categories.split(",")));
        film.setTrailer(trailer);
        film.setActors(List.of(actors.split(",")));

        Film savedFilm = filmService.saveFilm(film, image, largeImage);
        return new ResponseEntity<>(savedFilm, HttpStatus.OK);
    }

    @PostMapping("/addFilmList")
    @Operation(summary = "Add a list of films", responses = {
            @ApiResponse(responseCode = "200", description = "Add film successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<MyApiResponse> addFilmList(@RequestBody @Valid List<Film> films) {
        return new ResponseEntity<>(filmService.saveFilmList(films), HttpStatus.OK);
    }

    @PutMapping(value = "/updateFilm/{filmId}", consumes = "multipart/form-data")
    @Operation(summary = "Update a film", responses = {
            @ApiResponse(responseCode = "200", description = "Update film successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Film.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Film is not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<Film> updateFilm(
            @PathVariable(name = "filmId") @Valid Long filmId,
            @RequestPart("title") String title,
            @RequestPart("description") String description,
            @RequestPart("durationInMins") String durationInMins,
            @RequestPart("language") String language,
            @RequestPart("releaseDate") String releaseDate,
            @RequestPart("country") String country,
            @RequestPart("categories") String categories,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "largeImage", required = false) MultipartFile largeImage,
            @RequestPart("trailer") String trailer,
            @RequestPart("actors") String actors) throws Exception {
        Film film = new Film();
        film.setId(filmId);
        film.setTitle(title);
        film.setDescription(description);
        film.setDurationInMins(Integer.parseInt(durationInMins));
        film.setLanguage(language);
        film.setReleaseDate(LocalDate.parse(releaseDate, DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        film.setCountry(country);
        film.setCategories(List.of(categories.split(",")));
        film.setTrailer(trailer);
        film.setActors(List.of(actors.split(",")));

        Film updatedFilm = filmService.updateFilm(film, image, largeImage);
        return new ResponseEntity<>(updatedFilm, HttpStatus.OK);
    }

    @DeleteMapping("/remove/{filmId}")
    @Operation(summary = "Remove A Film", responses = {
            @ApiResponse(responseCode = "200", description = "Remove Film Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Film is not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<MyApiResponse> removeFilm(@PathVariable(name = "filmId") @Valid Long filmId) {
        return ResponseEntity.ok().body(filmService.removeFilm(filmId));
    }

    @GetMapping("/getFilmsByStatus")
    @Operation(summary = "Get films by status", responses = {
            @ApiResponse(responseCode = "200", description = "Get films successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = FilmInformationResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid status", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> getFilmsByStatus(@RequestParam @Valid FilmStatus status) {
        try {
            List<FilmInformationResponse> films = filmService.getFilmsByStatus(status);
            return ResponseEntity.ok(films);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid film status: " + status));
        }
    }

    @GetMapping("/searchFilmsByPrefix")
    @Operation(summary = "Search films by title prefix", responses = {
            @ApiResponse(responseCode = "200", description = "Films retrieved successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = FilmInformationResponse.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "No films found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<FilmInformationResponse>> searchFilmsByTitlePrefix(
            @RequestParam @Valid String prefix,
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "50") @Valid Integer pageSize) {
        List<FilmInformationResponse> films = filmService.searchFilmsByTitlePrefix(prefix, pageNumber, pageSize);
        if (films.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // Trả 404 nếu không tìm thấy
        }
        return new ResponseEntity<>(films, HttpStatus.OK); // Trả 200 nếu có kết quả
    }
}