package com.example.besrc.Repository;

import com.example.besrc.Entities.AccountTemp;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@Transactional
public interface AccountTempRepository extends JpaRepository<AccountTemp, Integer> {

    void deleteByUsername(String username);

    int countByIp(String ip);

    Optional<AccountTemp> findByCode(String code);

    Boolean existsByUsername(String username);
    Boolean existsByEmail (String email);

    Optional<AccountTemp> findByEmail(String email);
}
