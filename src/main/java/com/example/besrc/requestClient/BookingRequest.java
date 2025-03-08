package com.example.besrc.requestClient;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class BookingRequest {

    // Getter & Setter
    @JsonProperty(value = "seat_index")
    @NotEmpty(message = "Seat list cannot be empty")
    @Size(min = 1, message = "At least one seat must be selected")
    private List<String> seatIndex;

    @JsonProperty(value = "show_id")
    @NotBlank(message = "Show ID cannot be blank")
    private String showId;

    // Constructor
    public BookingRequest() {}

}
