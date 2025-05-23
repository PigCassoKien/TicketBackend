package com.example.besrc.requestClient;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

public class PaymentRequest {
    @JsonProperty(value = "bookingID")
    @NotNull
    @NotBlank
    private String bookingID;

    @Getter
    @JsonProperty(value = "paymentType")
    @NotNull
    @NotBlank
    private String paymentType;

    public PaymentRequest(String bookingID, String paymentType) {
        this.bookingID = bookingID;
        this.paymentType = paymentType;
    }
    public PaymentRequest() {

    }
    public String getBookingId() {
        return this.bookingID;
    }

}
