package com.example.besrc.requestClient;

import com.example.besrc.Entities.EnumEntities.BookingStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BookingUpdateRequest {

    private BookingStatus status;

    private List<String> seatIndex;
}
