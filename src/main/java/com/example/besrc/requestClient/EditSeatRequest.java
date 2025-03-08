package com.example.besrc.requestClient;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class EditSeatRequest {

    @NotNull
    @NotBlank
    private Long id; // Thêm id

    @NotNull
    private int row;

    @NotNull
    private int col;

    @NotNull
    @NotBlank
    private String type;

    @NotNull
    @NotBlank
    private String status;

}
