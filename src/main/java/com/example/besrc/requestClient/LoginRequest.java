package com.example.besrc.requestClient;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class LoginRequest {

    @NotNull
    @NotBlank
    private String username;

    @NotNull
    @NotBlank
    private String password;

    public LoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }


    public @NotNull @NotBlank String getUsername() {
        return this.username;
    }

    public void setUsername(@NotNull @NotBlank String username) {
        this.username = username;
    }

    public @NotNull @NotBlank String getPassword() {
        return this.password;
    }

    public void setPassword(@NotNull @NotBlank String password) {
        this.password = password;
    }
}
