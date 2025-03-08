package com.example.besrc.requestClient;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class NewPasswordRequest {

    @NotNull
    @NotBlank
    private String newPassword;

    public @NotNull @NotBlank String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(@NotNull @NotBlank String newPassword) {
        this.newPassword = newPassword;
    }
}
