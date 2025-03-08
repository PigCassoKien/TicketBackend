package com.example.besrc.requestClient;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class HashRequest {

    @NotBlank
    @NotNull
    @JsonProperty(value = "bookingId")
    private String bookingId;

    @NotBlank
    @NotNull
    @JsonProperty(value = "card_id")
    private String cardId;

    @NotBlank
    @NotNull
    @JsonProperty(value = "card_name")
    private String cardName;

    @NotBlank
    @NotNull
    @JsonProperty(value = "cvv_number")
    private int cvvNumber;

    public HashRequest(String bookingId, String cardId, String cardName, int cvvNumber) {
        this.bookingId = bookingId;
        this.cardId = cardId;
        this.cardName = cardName;
        this.cvvNumber = cvvNumber;
    }

    public @NotBlank @NotNull String getBookingId() {
        return bookingId;
    }

    public void setBookingId(@NotBlank @NotNull String bookingId) {
        this.bookingId = bookingId;
    }

    public @NotBlank @NotNull String getCardId() {
        return cardId;
    }

    public void setCardId(@NotBlank @NotNull String cardId) {
        this.cardId = cardId;
    }

    public @NotBlank @NotNull String getCardName() {
        return cardName;
    }

    public void setCardName(@NotBlank @NotNull String cardName) {
        this.cardName = cardName;
    }

    @NotBlank
    @NotNull
    public int getCvvNumber() {
        return cvvNumber;
    }

    public void setCvvNumber(@NotBlank @NotNull int cvvNumber) {
        this.cvvNumber = cvvNumber;
    }
}
