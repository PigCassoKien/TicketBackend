package com.example.besrc.Repository;

import com.example.besrc.Entities.Category;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByCategoryName(@NotBlank String categoryName);

    List<Category> findAllByCategoryName(String CategoryName);

    List<Category> findByCategoryNameContaining(@NotBlank String categoryName);

    Category findByCategoryName( String CategoryName);

}
