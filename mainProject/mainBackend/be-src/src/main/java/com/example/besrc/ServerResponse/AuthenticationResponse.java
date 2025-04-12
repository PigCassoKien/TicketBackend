package com.example.besrc.ServerResponse;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AuthenticationResponse {
    private String token;
    private String refreshToken;
    private String username;
    private String email;
    private String fullName;
    private String phoneNumber;

    public AuthenticationResponse() {

    }

    public AuthenticationResponse(String token, String refreshToken, String username, String email, String fullName, String phoneNumber) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
    }

}
