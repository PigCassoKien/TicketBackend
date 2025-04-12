package com.example.besrc.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "Token")
public class JWTToken {

    @Id
    @GeneratedValue(generator = "custom-uuid")
    @UuidGenerator
    @Column(name = "tokenId", unique = true, nullable = false, length = 255, insertable = false)
    private String tokenId;


    @Column(name = "refresh_token", length = 3000)
    @NotBlank
    @NotNull
    private String refreshToken;

    @Column(name = "access_token", length = 3000)
    @NotBlank
    @NotNull
    private String accessToken;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;


    public JWTToken() {}

    public JWTToken(Account account, String refreshToken, String accessToken) {
        this.account = account;
        this.refreshToken = refreshToken;
        this.accessToken = accessToken;
    }

    public String getTokenId() {
        return tokenId;
    }

    public void setTokenId(String tokenId) {
        this.tokenId = tokenId;
    }

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
    }

    public @NotBlank @NotNull String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(@NotBlank @NotNull String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public @NotBlank @NotNull String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(@NotBlank @NotNull String accessToken) {
        this.accessToken = accessToken;
    }
}
