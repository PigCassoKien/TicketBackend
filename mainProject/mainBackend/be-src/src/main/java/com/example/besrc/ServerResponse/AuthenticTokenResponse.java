package com.example.besrc.ServerResponse;

import com.example.besrc.Entities.JWTToken;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AuthenticTokenResponse {

    private JWTToken data;
    private String accessDecrypt;
    private String refreshDecrypt;

    public AuthenticTokenResponse(JWTToken data, String accessDecrypt, String refreshDecrypt) {
        this.data = data;
        this.accessDecrypt = accessDecrypt;
        this.refreshDecrypt = refreshDecrypt;
    }

}
