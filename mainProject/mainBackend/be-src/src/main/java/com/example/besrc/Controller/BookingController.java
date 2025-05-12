package com.example.besrc.Controller;

import com.example.besrc.ServerResponse.BookingResponse;
import com.example.besrc.ServerResponse.ErrorResponse;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.Service.BookingService;
import com.example.besrc.requestClient.BookingRequest;
import com.example.besrc.requestClient.BookingUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/booking")
@Tag(name = "Booking")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @GetMapping("{bookingId}")
    @Operation(summary = "Booking ID Service", responses = {
            @ApiResponse(responseCode = "200", description = "Get all ticket's information.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookingResponse.class))),
            @ApiResponse(responseCode = "404", description = "Ticket or User is not found.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Unauthorized access to booking.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> getBookingByID(Principal principal,
                                            @Valid @PathVariable(value = "bookingId") String booking_id) {
        return ResponseEntity.ok().body(bookingService.getBookingById(principal.getName(), booking_id));
    }

    @PostMapping("/create")
    @Operation(summary = "Create Booking Service (User is required)", responses = {
            @ApiResponse(responseCode = "200", description = "Create Booking Bill Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookingResponse.class))),
            @ApiResponse(responseCode = "404", description = "NOT FOUND", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "400", description = "The maximum number of seats that can be booked at one time is 8.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Seats are full, please book another show or wait until the next show.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Seats are unavailable, please choose another seat.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<?> createBooking(Principal principal, @Valid @RequestBody BookingRequest request) {
        return ResponseEntity.ok().body(bookingService.createBooking(principal.getName(), request));
    }

    @GetMapping("/all")
    @Operation(summary = "Get All Booking Service (User is required)", responses = {
            @ApiResponse(responseCode = "200", description = "Get all booking information.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookingResponse.class))),
            @ApiResponse(responseCode = "404", description = "Ticket or User is not found.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<?> getAllBookingFromAnAccount(Principal principal) {
        return ResponseEntity.ok().body(bookingService.getBookingList(principal.getName()));
    }

    @DeleteMapping("{bookingId}/cancel")
    @Operation(summary = "Cancel Booking Service (User is required)", responses = {
            @ApiResponse(responseCode = "200", description = "Cancel Booking Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookingResponse.class))),
            @ApiResponse(responseCode = "404", description = "Ticket or User is not found.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid Cancel Service.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Booking is not found.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Invalid Booking", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<?> cancelBookingById(Principal principal, @Valid @PathVariable(value = "bookingId") String booking_id) {
        return ResponseEntity.ok().body(bookingService.cancelBooking(principal.getName(), booking_id));
    }

    @GetMapping("/user/{username}/getAllOfAccountBooking")
    @Operation(summary = "Get all Bookings Information (Admin is required)", responses = {
            @ApiResponse(responseCode = "200", description = "Get all bookings information", content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookingResponse.class))),
            @ApiResponse(responseCode = "404", description = "Account is not found.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> getAllBookingsFromAnAccount(@Valid @PathVariable(value = "username") String username) {
        return ResponseEntity.ok().body(bookingService.getBookingList(username));
    }

    @GetMapping("/user/{username}/getOneOfAccountBooking/{bookingId}")
    @Operation(summary = "Get One Bookings Information (Admin is required)", responses = {
            @ApiResponse(responseCode = "200", description = "Get booking information Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookingResponse.class))),
            @ApiResponse(responseCode = "404", description = "Account or ticket is not found.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> getBookingFromAnAccountById(@Valid @PathVariable(value = "username") String username, @Valid @PathVariable(value = "bookingId") String booking_id) {
        return ResponseEntity.ok().body(bookingService.getBookingById(username, booking_id));
    }

    @PutMapping("/user/{username}/setBookingStatus/{bookingId}")
    @Operation(summary = "Set Booking Status (Admin is required)", responses = {
            @ApiResponse(responseCode = "200", description = "Set booking status successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookingResponse.class))),
            @ApiResponse(responseCode = "404", description = "Account or ticket is not found.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid Ticket or Account", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> setBookingStatusFromAccount(@Valid @PathVariable(value = "username") String username, @Valid @PathVariable(value = "bookingId") String booking_id, @RequestParam("value") @Valid String status) {
        return ResponseEntity.ok().body(bookingService.setBookingStatus(username, booking_id, status));
    }

    @GetMapping("get_all")
    @Operation(summary = "Get All Bookings (Admin is required)", responses = {
            @ApiResponse(responseCode = "200", description = "Get all bookings information.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookingResponse.class))),
            @ApiResponse(responseCode = "403", description = "Access denied, admin role required.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> getAllBookings(Principal principal) {
        return ResponseEntity.ok().body(bookingService.getAllBookings());
    }

    @PutMapping("{bookingId}/update")
    @Operation(summary = "Update Booking Information (Admin is required)", responses = {
            @ApiResponse(responseCode = "200", description = "Update booking information successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "Booking not found.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Only admin or super admin can update booking.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> updateBooking(Principal principal, @Valid @PathVariable(value = "bookingId") String bookingId, @Valid @RequestBody BookingUpdateRequest updateRequest) {
        return ResponseEntity.ok().body(bookingService.updateBooking(principal.getName(), bookingId, updateRequest));
    }

    @DeleteMapping("/delete/{bookingId}")
    @Operation(summary = "Delete Booking (Admin is required)", responses = {
            @ApiResponse(responseCode = "200", description = "Delete booking successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "Booking not found.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Only admin or super admin can delete booking.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> deleteBooking(Principal principal, @Valid @PathVariable(value = "bookingId") String bookingId) {
        return ResponseEntity.ok().body(bookingService.deleteBooking(principal.getName(), bookingId));
    }
}