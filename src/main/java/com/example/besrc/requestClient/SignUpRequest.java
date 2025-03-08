package com.example.besrc.requestClient;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SignUpRequest {

    @NotBlank
    @NotNull
    private String fullName;

    @NotBlank
    @NotNull
    private String username;

    @NotBlank
    @NotNull
    private String password;

    @NotBlank
    @NotNull
    @Email
    private String email;

    @NotBlank
    @NotNull
    private String address;

    @NotBlank
    @NotNull
    private String phoneNumber;

    public SignUpRequest(String fullName, String username, String address, String email, String password, String phoneNumber) {
        this.fullName = fullName;
        this.username = username;
        this.address = address;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
    }

    public @NotBlank @NotNull String getFullName() {
        return fullName;
    }

    public void setFullName(@NotBlank @NotNull String fullName) {
        this.fullName = fullName;
    }

    public @NotBlank @NotNull String getUsername() {
        return username;
    }

    public void setUsername(@NotBlank @NotNull String username) {
        this.username = username;
    }

    public @NotBlank @NotNull String getPassword() {
        return password;
    }

    public void setPassword(@NotBlank @NotNull String password) {
        this.password = password;
    }

    public @NotBlank @NotNull @Email String getEmail() {
        return email;
    }

    public void setEmail(@NotBlank @NotNull @Email String email) {
        this.email = email;
    }

    public @NotBlank @NotNull String getAddress() {
        return address;
    }

    public void setAddress(@NotBlank @NotNull String address) {
        this.address = address;
    }

    public @NotBlank @NotNull String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(@NotBlank @NotNull String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    @Override
    public String toString() {
        return "SignUpRequest{" +
                "fullName='" + fullName + '\'' +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", address='" + address + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                '}';
    }
}
