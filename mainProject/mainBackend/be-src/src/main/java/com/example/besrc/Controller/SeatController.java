package com.example.besrc.Controller;

import com.example.besrc.Entities.EnumEntities.ESeat;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.ServerResponse.SeatResponse;
import com.example.besrc.ServerResponse.ShowSeatResponse;
import com.example.besrc.Service.SeatService;
import com.example.besrc.requestClient.EditSeatRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seat/")
@Tag(name = " Seat Controller")
public class SeatController {

    @Autowired
    private SeatService seatService;


    @GetMapping("/{showId}/{row}/{col}")
    @Operation(summary = "Get Seat Information", responses = {
            @ApiResponse(responseCode = "200", description = "Successfully fetched seat info",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = SeatResponse.class))),
            @ApiResponse(responseCode = "404", description = "Seat not found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<SeatResponse>> getSeat(@PathVariable("showId") String showId,
                                                      @PathVariable("row") int row,
                                                      @PathVariable("col") int col) {
        return ResponseEntity.ok(seatService.getSeat(showId, row, col));
    }

    @PutMapping("/update")
    @Operation(summary = "Update Seat Information", responses = {
            @ApiResponse(responseCode = "200", description = "Successfully updated seat",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid type or status",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Seat not found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<MyApiResponse> updateSeat(@Valid @RequestBody EditSeatRequest request) {
        return ResponseEntity.ok(seatService.updateSeat(request));
    }

    @DeleteMapping("/delete/{showId}/{row}/{col}")
    @Operation(summary = "Delete Seat", responses = {
            @ApiResponse(responseCode = "200", description = "Successfully deleted seat",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "Seat not found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<MyApiResponse> deleteSeat(@PathVariable("showId") String showId,
                                                    @PathVariable("row") int row,
                                                    @PathVariable("col") int col) {
        return ResponseEntity.ok(seatService.deleteSeat(showId, row, col));
    }

    @DeleteMapping("/deleteAll/{showId}")
    @Operation(summary = "Delete All Seats In A Show", responses = {
            @ApiResponse(responseCode = "200", description = "Successfully deleted all seats",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class)))
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<MyApiResponse> deleteAllSeats(@PathVariable("showId") String showId) {
        return ResponseEntity.ok(seatService.deleteAllSeats(showId));
    }

    @GetMapping("/status/{showId}/{status}")
    @Operation(summary = "Get Seats By Status", responses = {
            @ApiResponse(responseCode = "200", description = "Successfully fetched seats",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = SeatResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid status",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<ShowSeatResponse>> getSeatsByStatus(
            @PathVariable("showId") String showId,
            @PathVariable("status") String status) {
        return ResponseEntity.ok(seatService.getSeatByStatus(showId, status));
    }

    @GetMapping("/type/{showId}/{seatType}")
    @Operation(summary = "Get Seats By Type", responses = {
            @ApiResponse(responseCode = "200", description = "Successfully fetched seats",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = SeatResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid seat type",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<List<ShowSeatResponse>> getSeatsByType(
            @PathVariable("showId") String showId,
            @PathVariable("seatType") ESeat seatType) {
        return ResponseEntity.ok(seatService.getSeatBySeatType(showId, seatType));
    }

    @GetMapping("/{showId}/{seatId}/index")
    @Operation(summary = "Get Seat Index By Seat ID and Show ID", responses = {
            @ApiResponse(responseCode = "200", description = "Successfully fetched seat index",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ShowSeatResponse.class))),
            @ApiResponse(responseCode = "404", description = "Seat not found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ShowSeatResponse> getSeatIndex(
            @PathVariable("seatId") Long seatId,
            @PathVariable("showId") String showId) {
        return ResponseEntity.ok(seatService.getSeatIndexBySeatIdAndShowId(seatId, showId));
    }

}
