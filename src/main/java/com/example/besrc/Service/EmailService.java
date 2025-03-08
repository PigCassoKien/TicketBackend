package com.example.besrc.Service;

import jakarta.mail.MessagingException;
import org.springframework.stereotype.Service;

@Service
public interface EmailService {
    void sendVerificationMail(String to, String subject, String content) throws MessagingException;
}
