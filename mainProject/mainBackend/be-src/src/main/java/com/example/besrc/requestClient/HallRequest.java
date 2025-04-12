package com.example.besrc.requestClient;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HallRequest {

    @NotBlank
    private String hallName;

    @NotNull
    @Min(value = 5, message = "Total row must be at least 5")
    private Integer totalRow;

    @NotNull
    @Min(value = 5, message = "Total column must be at least 5")
    private Integer totalCol;
}
