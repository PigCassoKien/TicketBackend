package com.example.besrc.Service;

import com.example.besrc.Entities.Account;
import com.example.besrc.Entities.JWTToken;
import com.example.besrc.ServerResponse.AuthenticTokenResponse;
import org.springframework.stereotype.Service;

@Service
public interface JWTokenService {
    public AuthenticTokenResponse getFromRefreshToken(String refresh_token);
    public AuthenticTokenResponse getData(Account account);
    public JWTToken saveInfo(Account user, String accessToken, String refreshToken);
    public JWTToken updateInfo(JWTToken data, String accessToken, String refreshToken);
    public String getAccessToken(Account user);
    public String getRefreshToken(Account user);
    public String setAccessToken(JWTToken data, String accessToken);
    public String setRefreshToken(JWTToken data, String refreshToken);

    public void saveRefreshToken(Account user, String refreshToken);

}
