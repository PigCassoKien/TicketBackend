package com.example.besrc.ServerResponse;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class EmailResponse {
    private String mail;
    private String subject;
    private String content;

    public EmailResponse(String mail, String subject, String content) {
        this.mail = mail;
        this.subject = subject;
        this.content = content;
    }

}
