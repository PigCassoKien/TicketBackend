package com.example.besrc.ServicesImplement;

import com.example.besrc.Entities.Account;
import com.example.besrc.Entities.JWTToken;
import com.example.besrc.Repository.JWTokenRepository;
import com.example.besrc.ServerResponse.AuthenticTokenResponse;
import com.example.besrc.Service.JWTokenService;
import com.example.besrc.utils.ChaCha20Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.Optional;


@Service("JWTokenService")
public class JWTTokenServiceImplement implements JWTokenService {
    final private String secretKey = "5fHdXeP2v7KNQ9WuE1V3SjhM8q4TxJcR12fM56tZ3GpLAdOa6B";
    final private Long IV = 218349725013876L;
    final private String salt = "a5b8d2f6c3e9f7b4";

    private final ChaCha20Utils cipher = new ChaCha20Utils(secretKey, IV, salt);

    @Autowired
    private JWTokenRepository jwTokenRepository;

    private AuthenticTokenResponse createResponse(JWTToken info) {
        String accessDecrypt = this.cipher.decrypt(info.getAccessToken());
        String refreshDecrypt = this.cipher.decrypt(info.getRefreshToken());
        return new AuthenticTokenResponse(info, accessDecrypt, refreshDecrypt);

    }
    @Override
    public AuthenticTokenResponse getFromRefreshToken(String refresh_token) {
        JWTToken data = jwTokenRepository.findByRefreshToken(refresh_token)
                .orElseThrow(() -> new AccessDeniedException("Invalid refresh token"));
        return this.createResponse(data);
    }

    @Override
    public AuthenticTokenResponse getData(Account account) {
        Optional<JWTToken> data = jwTokenRepository.findByAccountId(account.getId());
        return data.map(this::createResponse).orElse(null);
    }

    @Override
    public JWTToken saveInfo(Account account, String accessToken, String refreshToken) {
        String accessTokenEncrypt = cipher.encrypt(accessToken);
        String refreshTokenEncrypt = cipher.encrypt(refreshToken);
        JWTToken token = new JWTToken(account, refreshTokenEncrypt, accessTokenEncrypt);
        return jwTokenRepository.save(token);
    }

    @Override
    public JWTToken updateInfo(JWTToken data, String accessToken, String refreshToken) {
        String accessTokenEncrypt = cipher.encrypt(accessToken);
        String refreshTokenEncrypt = cipher.encrypt(refreshToken);
        data.setAccessToken(accessTokenEncrypt);
        data.setRefreshToken(refreshTokenEncrypt);
        return jwTokenRepository.save(data);
    }

    @Override
    public String getAccessToken(Account account) {
        JWTToken data = jwTokenRepository.findByAccountId(account.getId()).get();
        return this.cipher.decrypt(data.getAccessToken());
    }

    @Override
    public String getRefreshToken(Account account) {
        JWTToken data = jwTokenRepository.findByAccountId(account.getId()).get();
        return this.cipher.decrypt(data.getRefreshToken());
    }

    @Override
    public String setAccessToken(JWTToken data, String accessToken) {
        String accessTokenEncrypt = cipher.encrypt(accessToken);
        data.setAccessToken(accessTokenEncrypt);
        jwTokenRepository.save(data);
        return accessTokenEncrypt;
    }

    @Override
    public String setRefreshToken(JWTToken data, String refreshToken) {
        String refreshTokenEncrypt = cipher.encrypt(refreshToken);
        data.setRefreshToken(refreshTokenEncrypt);
        jwTokenRepository.save(data);
        return refreshTokenEncrypt;
    }

    @Override
    public void saveRefreshToken(Account user, String refreshToken) {
        Optional<JWTToken> existingToken = jwTokenRepository.findByAccount(user);

        if (existingToken.isPresent()) {
            // Nếu đã có token, cập nhật refresh token mới
            JWTToken token = existingToken.get();
            token.setRefreshToken(refreshToken);
            jwTokenRepository.save(token);
        } else {
            // Nếu chưa có, tạo token mới
            JWTToken token = new JWTToken();
            token.setAccount(user);
            token.setRefreshToken(refreshToken);
            jwTokenRepository.save(token);
        }
    }

}
