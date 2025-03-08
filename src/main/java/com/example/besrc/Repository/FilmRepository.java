package com.example.besrc.Repository;

import com.example.besrc.Entities.Film;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FilmRepository extends JpaRepository<Film, Long>, PagingAndSortingRepository<Film, Long> {

    boolean existsByTitle(@NotBlank String title);
    List<Film> findByTitleContaining(@NotBlank String title, Pageable pageable);

    @Query(value = "select f from Film f join f.categories t where t.categoryName like %:keyword%")
    List<Film> findByCategoriesContaining(@Param("keyword") String keyword);

}
