package com.example.besrc.Repository;

import com.example.besrc.Entities.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.Optional;

@Repository
public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
    Optional<VerificationCode> findByEmailAndCode(String email,String code);
    Optional<VerificationCode> findByEmail(String email);
    Optional<VerificationCode> findByCode(String code);
}
