package com.example.besrc.requestClient;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class RemoveHallRequest {
    @NotBlank
    @NotNull
    private String name;

}
