package com.example.besrc.Repository;

import com.example.besrc.Entities.SpamAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpamAccountRepository extends JpaRepository<SpamAccount, Integer> {
    Optional<SpamAccount> findByAccountId(String accountId);
    boolean existsByAccountId(String accountId);
}
