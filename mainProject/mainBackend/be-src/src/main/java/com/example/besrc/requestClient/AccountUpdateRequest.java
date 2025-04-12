package com.example.besrc.requestClient;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AccountUpdateRequest {

    private String fullName;

    private String phoneNumber;

    private String address;
}
