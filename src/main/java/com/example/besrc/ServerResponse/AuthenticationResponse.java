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

    public AuthenticationResponse() {

    }

    public AuthenticationResponse(String token, String refreshToken, String username, String email) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.username = username;
        this.email = email;
    }

}
