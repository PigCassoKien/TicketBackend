package com.example.besrc.Controller;

import com.example.besrc.Entities.Category;
import com.example.besrc.Repository.CategoryRepository;
import com.example.besrc.ServerResponse.ErrorResponse;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.Service.CategoryService;
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

import java.util.List;

@RestController
@RequestMapping("/api/category")
@Tag(name = "Category")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping("/getCategory")
    @Operation(summary = "Get All Category", responses = {
        @ApiResponse(responseCode = "200", description = "Get all category successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<Category>> getCategory() {
        return new ResponseEntity<List<Category>>(categoryService.getCategories(), HttpStatus.OK);
    }

    @GetMapping("/getCategory/{categoryId}")
    @Operation(summary = "Get Category By Id", responses = {
            @ApiResponse(responseCode = "200", description = "Get category by categoryId successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Category not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    public Category getCategoryById(@PathVariable(value = "categoryId") @Valid Long categoryId) {
        return categoryService.getCategoryById(categoryId);
    }

    @GetMapping("/getCategoryByName/{categoryName}")
    @Operation(summary = "Get Category By Name", responses = {
        @ApiResponse(responseCode = "200",description = "Get category by name successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Category not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<Category> findCategoryByName(@PathVariable(value = "categoryName") @Valid String categoryName) {
        return categoryRepository.findAllByCategoryName(categoryName);
    }

    @PostMapping("/saveCategory")
    @Operation(summary = "Save Category", responses = {
        @ApiResponse(responseCode = "200", description = "Save category successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<Category> saveCategory(@RequestBody @Valid Category category) {
        return ResponseEntity.ok(categoryService.saveCategory(category));
    }

    @PostMapping("/saveCategoryList")
    @Operation(summary = "Save Category List", responses = {
        @ApiResponse(responseCode = "200", description = "Save category list successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public MyApiResponse saveCategoryList(@RequestBody @Valid List<Category> categories) {
        return categoryService.saveListCategories(categories);
    }

    @PutMapping("/updateCategory/{categoryId}")
    @Operation(summary = "Update Category", responses = {
        @ApiResponse(responseCode = "200", description = "Update category successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Category not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public Category updateCategory(@PathVariable(value = "categoryId") @Valid Long categoryId, @RequestBody @Valid Category category) {
        category.setCategoryId(categoryId);
        return categoryService.updateCategory(category);
    }
    @DeleteMapping("/deleteCategory/{categoryId}")
    @Operation(summary = "Update Category", responses = {
            @ApiResponse(responseCode = "200", description = "Update category successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Category.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Category not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public MyApiResponse deleteCategory(@PathVariable(value = "categoryId") @Valid Long categoryId, @RequestBody @Valid Category category) {
        category.setCategoryId(categoryId);
        return categoryService.deleteCategory(categoryId);
    }
}
