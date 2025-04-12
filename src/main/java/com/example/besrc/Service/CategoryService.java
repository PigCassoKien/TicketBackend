package com.example.besrc.Service;

import com.example.besrc.Entities.Category;
import com.example.besrc.ServerResponse.MyApiResponse;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public interface CategoryService {

    public List<Category> getCategories();
    public Category saveCategory(Category category);

    public MyApiResponse saveListCategories(List<Category> categories);

    public MyApiResponse deleteCategory(Long id);

    public Category getCategoryById(Long id);
    public Category updateCategory(Category category);
    public Category getCategoryByTitle(String title);

}
