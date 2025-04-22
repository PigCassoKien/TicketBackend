package com.example.besrc.ServicesImplement;

import com.example.besrc.Entities.EnumEntities.FilmStatus;
import com.example.besrc.Entities.Film;
import com.example.besrc.Exception.BadRequestException;
import com.example.besrc.Exception.NotFoundException;
import com.example.besrc.Repository.FilmRepository;
import com.example.besrc.Security.InputValidationFilter;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.ServerResponse.FilmInformationResponse;
import com.example.besrc.Service.FilmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FilmServiceImplement implements FilmService {

    @Autowired
    private FilmRepository filmRepository;

    @Autowired
    private InputValidationFilter inputValidationFilter;

    private static final String IMAGE_UPLOAD_DIR = "mainProject/mainBackend/be-src/src/main/resources/static/filmImages";
    private static final String LARGE_IMAGE_UPLOAD_DIR = "mainProject/mainBackend/be-src/src/main/resources/static/largeImages/";

    @Override
    public List<FilmInformationResponse> getFilms(int pageNumber, int pageSize) {
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        List<Film> films = filmRepository.findAll(pageable).getContent();

        films.forEach(film -> film.setStatus(determineStatus(film.getReleaseDate())));
        return films.stream()
                .map(FilmInformationResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Film saveFilm(Film film, MultipartFile image, MultipartFile largeImage) throws IOException {
        if (filmRepository.existsByTitle(film.getTitle())) {
            throw new BadRequestException("Film name already exists");
        }

        // Handle image uploads
        if (image != null && !image.isEmpty()) {
            String imagePath = saveImage(image, film.getTitle(), IMAGE_UPLOAD_DIR);
            film.setImage(imagePath);
        }
        if (largeImage != null && !largeImage.isEmpty()) {
            String largeImagePath = saveImage(largeImage, film.getTitle(), LARGE_IMAGE_UPLOAD_DIR);
            film.setLargeImage(largeImagePath);
        }

        // Set status based on release date
        film.setStatus(determineStatus(film.getReleaseDate()));
        return filmRepository.save(film);
    }

    @Override
    @Transactional
    public MyApiResponse saveFilmList(List<Film> films) {
        for (Film film : films) {
            if (!filmRepository.existsByTitle(film.getTitle())) {
                film.setStatus(determineStatus(film.getReleaseDate()));
                filmRepository.save(film);
            }
        }
        return new MyApiResponse("Save successfully");
    }

    @Override
    public List<FilmInformationResponse> getFilmName(String title, int pageNumber, int pageSize) {
        String keyWord = inputValidationFilter.sanitizeInput(title);
        if (inputValidationFilter.checkInput(keyWord) || keyWord.isEmpty()) {
            throw new BadRequestException("Invalid input");
        }

        Pageable pages = PageRequest.of(pageNumber, pageSize);
        List<Film> films = filmRepository.findByTitleContaining(keyWord, pages);
        // Update status for each film in real-time
        films.forEach(film -> film.setStatus(determineStatus(film.getReleaseDate())));
        return films.stream()
                .map(FilmInformationResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<FilmInformationResponse> getFilmCategory(String category, int pageNumber, int pageSize) {
        String keyWord = inputValidationFilter.sanitizeInput(category);
        if (inputValidationFilter.checkInput(keyWord) || keyWord.isEmpty()) {
            throw new BadRequestException("Invalid input");
        }

        Pageable pages = PageRequest.of(pageNumber, pageSize);
        List<Film> films = filmRepository.findByCategoriesContaining(keyWord, pages);
        // Update status for each film in real-time
        films.forEach(film -> film.setStatus(determineStatus(film.getReleaseDate())));
        return films.stream()
                .map(FilmInformationResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    public FilmInformationResponse getFilm(Long id) {
        Film film = filmRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Film ID: " + id + " NOT FOUND"));
        // Update status in real-time
        film.setStatus(determineStatus(film.getReleaseDate()));
        return new FilmInformationResponse(film);
    }

    @Override
    public MyApiResponse removeFilm(Long id) {
        if (!filmRepository.existsById(id)) {
            throw new NotFoundException("Film ID: " + id + " NOT FOUND");
        }
        filmRepository.deleteById(id);
        return new MyApiResponse("Remove successfully");
    }

    @Override
    @Transactional
    public Film updateFilm(Film film, MultipartFile image, MultipartFile largeImage) throws IOException {
        // Lấy phim hiện tại từ cơ sở dữ liệu
        Film existingFilm = filmRepository.findById(film.getId())
                .orElseThrow(() -> new NotFoundException("Film ID: " + film.getId() + " NOT FOUND"));

        // Cập nhật các trường của film từ dữ liệu đầu vào
        existingFilm.setTitle(film.getTitle());
        existingFilm.setDescription(film.getDescription());
        existingFilm.setDurationInMins(film.getDurationInMins());
        existingFilm.setLanguage(film.getLanguage());
        existingFilm.setReleaseDate(film.getReleaseDate());
        existingFilm.setCountry(film.getCountry());
        existingFilm.setCategories(film.getCategories());
        existingFilm.setActors(film.getActors());
        existingFilm.setTrailer(film.getTrailer());

        // Xử lý ảnh nhỏ
        if (image != null && !image.isEmpty()) {
            String oldImagePath = existingFilm.getImage();
            if (oldImagePath != null && !oldImagePath.isEmpty()) {
                deleteImage(oldImagePath, IMAGE_UPLOAD_DIR);
            }
            String newImagePath = saveImage(image, film.getTitle(), IMAGE_UPLOAD_DIR);
            existingFilm.setImage(newImagePath);
        }

        // Xử lý ảnh lớn
        if (largeImage != null && !largeImage.isEmpty()) {
            String oldLargeImagePath = existingFilm.getLargeImage();
            if (oldLargeImagePath != null && !oldLargeImagePath.isEmpty()) {
                deleteImage(oldLargeImagePath, LARGE_IMAGE_UPLOAD_DIR);
            }
            String newLargeImagePath = saveImage(largeImage, film.getTitle(), LARGE_IMAGE_UPLOAD_DIR);
            existingFilm.setLargeImage(newLargeImagePath);
        }

        // Cập nhật trạng thái: Nếu client gửi status, sử dụng giá trị đó; nếu không, tính toán dựa trên releaseDate
        if (film.getStatus() != null) {
            existingFilm.setStatus(film.getStatus());
        } else {
            existingFilm.setStatus(determineStatus(film.getReleaseDate()));
        }

        // Lưu phim đã cập nhật vào cơ sở dữ liệu
        return filmRepository.save(existingFilm);
    }

    // Phương thức hỗ trợ để xóa ảnh cũ
    private void deleteImage(String fileName, String uploadDir) throws IOException {
        Path filePath = Paths.get(uploadDir, fileName);
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }
    }

    // Phương thức lưu ảnh (đã có sẵn, giữ nguyên)
    private String saveImage(MultipartFile file, String title, String uploadDir) throws IOException {
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        String fileName = title + ".jpg";
        Path filePath = Paths.get(uploadDir, fileName);
        Files.write(filePath, file.getBytes());

        return fileName;
    }

    private FilmStatus determineStatus(LocalDate releaseDate) {
        LocalDate now = LocalDate.now();
        return releaseDate.isAfter(now) ? FilmStatus.UPCOMING : FilmStatus.PLAYING;
    }

    @Override
    public List<FilmInformationResponse> getFilmsByStatus(FilmStatus status) {
        List<Film> films = filmRepository.findByStatus(status);
        // Update status for each film in real-time
        films.forEach(film -> film.setStatus(determineStatus(film.getReleaseDate())));
        return films.stream()
                .map(FilmInformationResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<FilmInformationResponse> searchFilmsByTitlePrefix(String prefix, int pageNumber, int pageSize) {
        // Kiểm tra prefix null
        if (prefix == null) {
            throw new BadRequestException("Prefix cannot be null");
        }

        String sanitizedPrefix = inputValidationFilter.sanitizeInput(prefix);
        // Sửa logic: ném lỗi nếu input KHÔNG hợp lệ hoặc rỗng
        if (!inputValidationFilter.checkInput(sanitizedPrefix) || sanitizedPrefix.isEmpty()) {
            throw new BadRequestException("Invalid prefix input");
        }

        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        List<Film> films = filmRepository.findByTitleStartingWith(sanitizedPrefix, pageable);

        // Cập nhật trạng thái thực tế cho từng phim
        films.forEach(film -> film.setStatus(determineStatus(film.getReleaseDate())));
        return films.stream()
                .map(FilmInformationResponse::new)
                .collect(Collectors.toList());
    }
}