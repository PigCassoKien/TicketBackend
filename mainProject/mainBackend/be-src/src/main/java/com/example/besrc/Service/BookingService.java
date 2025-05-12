package com.example.besrc.Service;

import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.ServerResponse.BookingResponse;
import com.example.besrc.requestClient.BookingRequest;
import com.example.besrc.requestClient.BookingUpdateRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface BookingService {
    public BookingResponse createBooking(String username, BookingRequest request);
    public MyApiResponse cancelBooking(String username, String bookingId);
    public MyApiResponse setBookingStatus(String username, String bookingId, String status);
    public List<BookingResponse> getBookingList(String username);
    public BookingResponse getBookingById(String username, String bookingId);

    List<BookingResponse> getAllBookings();
    public MyApiResponse updateBooking(String username, String bookingId, BookingUpdateRequest updateRequest);
    public MyApiResponse deleteBooking(String username, String bookingId);
}
