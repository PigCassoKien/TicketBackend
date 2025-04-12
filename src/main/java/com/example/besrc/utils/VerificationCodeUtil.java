package com.example.besrc.utils;

import java.security.SecureRandom;

public class VerificationCodeUtil {
    private static final SecureRandom random = new SecureRandom();

    public static String generateCode() {
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }
}
