package com.example.besrc.ServicesImplement;

import com.example.besrc.Security.InputValidationFilter;
import com.example.besrc.utils.RegexExtractor;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.owasp.encoder.Encode;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Service
@Primary
public class InputValidationServiceImplement implements InputValidationFilter {

    private final String mySqlPattern = RegexExtractor.SQL;
    private final String XssPattern = RegexExtractor.XSS;
    private final String allowPattern = RegexExtractor.NORMAL_TEXT;
    @Override
    public String sanitizeInput(String input) {
        if (input == null) return null;

        // Loại bỏ ký tự nguy hiểm trước khi mã hóa HTML
        String cleanedInput = input.replaceAll("[<>\"'%;()&+]", "").trim();

        return Encode.forHtml(cleanedInput);
    }

    @Override
    public String sanitizeInputWithSafeList(String input, Safelist safelist) {
        return Jsoup.clean(input, safelist);
    }

    @Override
    public boolean containsSqlInjection(String input) {
        return input.matches(this.mySqlPattern);
    }

    @Override
    public boolean containsXss(String input) {
        return input.matches(this.XssPattern);
    }

    @Override
    public boolean checkInput(String input) {
        return input == null || !input.matches(".*[^a-zA-Z0-9\\s\\-_,.].*");
    }

}
