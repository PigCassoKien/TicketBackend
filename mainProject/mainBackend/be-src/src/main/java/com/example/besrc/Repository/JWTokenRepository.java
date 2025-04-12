package com.example.besrc.Repository;

import com.example.besrc.Entities.Account;
import com.example.besrc.Entities.JWTToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JWTokenRepository extends JpaRepository<JWTToken, String> {
    Optional<JWTToken> findByAccountId(String id);
    Optional<JWTToken> findByRefreshToken(String refreshToken);
    Optional<JWTToken> findByAccount(Account user);
}
