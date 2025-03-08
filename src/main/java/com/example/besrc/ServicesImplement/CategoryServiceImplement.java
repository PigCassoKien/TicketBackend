package com.example.besrc.ServicesImplement;

import com.example.besrc.Entities.Category;
import com.example.besrc.Exception.BadRequestException;
import com.example.besrc.Exception.NotFoundException;
import com.example.besrc.Repository.CategoryRepository;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.Service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CategoryServiceImplement implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;
    @Override
    public List<Category> getCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public Category saveCategory(Category category) {
        if (categoryRepository.existsByCategoryName(category.getCategoryName())) {
            throw new BadRequestException("Category name already exists");

        }
        return categoryRepository.save(category);
    }

    @Override
    public MyApiResponse saveListCategories(List<Category> categories) {
        List<Category> saveCategories = new ArrayList<>();
        for (Category category : categories) {
            if (categoryRepository.existsByCategoryName(category.getCategoryName())) {
                continue;
            }

            saveCategories.add(categoryRepository.save(category));

        }
        return new MyApiResponse("Save successfully");
    }

    @Override
    public MyApiResponse deleteCategory(Long id) {
        if(!categoryRepository.existsById(id)) {
            throw new NotFoundException("Category ID: " + id + " NOT FOUND");
        }
        categoryRepository.deleteById(id);
        return new MyApiResponse("Delete successfully");
    }

    @Override
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id).orElseThrow(
                () -> new NotFoundException("Category ID: " + id + " NOT FOUND")
        );
    }

    @Override
    public Category updateCategory(Category category) {
        if (!categoryRepository.existsById(category.getCategoryId())) {
            throw new NotFoundException("Category ID: " + category.getCategoryId() + " NOT FOUND");
        }
        if (categoryRepository.existsByCategoryName(category.getCategoryName())) {
            throw new BadRequestException("Category name already exists");
        }

        return categoryRepository.save(category);
    }

    @Override
    public Category getCategoryByTitle(String title) {
        return categoryRepository.findByCategoryName(title);
    }
}
