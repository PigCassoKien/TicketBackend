package com.example.besrc.Repository;

import com.example.besrc.Entities.EnumEntities.FilmStatus;
import com.example.besrc.Entities.Film;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FilmRepository extends JpaRepository<Film, Long>, PagingAndSortingRepository<Film, Long> {

    boolean existsByTitle(@NotBlank String title);

    List<Film> findByTitleContaining(@NotBlank String title, Pageable pageable);

    // Tìm kiếm phim có danh mục chứa từ khóa tìm kiếm
    List<Film> findByCategoriesContaining(String keyword, Pageable pageable);

    List<Film> findByStatus(FilmStatus status);

    List<Film> findByTitleStartingWith(String prefix, Pageable pageable);
}
