package com.example.besrc.Controller;

import com.example.besrc.ServerResponse.ErrorResponse;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.ServerResponse.ShowInformationResponse;
import com.example.besrc.ServerResponse.ShowSeatResponse;
import com.example.besrc.Service.CinemaShowService;
import com.example.besrc.requestClient.ShowRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/show")
@Tag(name = "Show Controller")
public class ShowController {

    @Autowired
    private CinemaShowService cinemaShowService;

    @GetMapping("/{showId}")
    @Operation(summary = "Get Show Information", responses = {
            @ApiResponse(responseCode = "200", description = "Successfully get Show Information", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ShowInformationResponse.class))),
            @ApiResponse(responseCode = "404", description = "Show is not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    //@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> getShowById(@Valid @PathVariable(value = "showId") String showId) {
        return ResponseEntity.ok(cinemaShowService.getShowInformation(showId));
    }

    @GetMapping("/{showId}/seats")
    @Operation(summary = "Get All Show Seats", responses = {
            @ApiResponse(responseCode = "200", description = "Successfully get Show Information", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ShowSeatResponse.class))),
            @ApiResponse(responseCode = "404", description = "Show is not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    public ResponseEntity<?> getAllSeats(@Valid @PathVariable(value = "showId") String showId) {
        return ResponseEntity.ok().body(cinemaShowService.getAllShowSeats(showId));
    }

    @GetMapping("/getByFilm")
    @Operation(summary = "Get All Show By Film", responses = {
            @ApiResponse(responseCode = "200", description = "Successfully get Show Information", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ShowInformationResponse.class))),
            @ApiResponse(responseCode = "404", description = "Film is not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> getShowByFilmId(@Valid @RequestParam(value = "filmId") String filmId) {
        return ResponseEntity.ok().body(cinemaShowService.getAllShowByFilmId(filmId));
    }



    @GetMapping("/getByHall")
    @Operation(summary = "Get All Show By Hall", responses = {
            @ApiResponse(responseCode = "200", description = "Successfully get Show Information", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ShowInformationResponse.class))),
            @ApiResponse(responseCode = "404", description = "Hall is not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> getShowByHallId(@Valid @RequestParam(value = "hallId") String hallId) {
        return ResponseEntity.ok().body(cinemaShowService.getAllShowsByHallId(hallId));
    }

    @GetMapping("/allShow")
    @Operation(summary = "Get All Shows", responses = {
            @ApiResponse(responseCode = "200", description = "Successfully get Show Information", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ShowInformationResponse.class))),
            @ApiResponse(responseCode = "404", description = "Show is not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public List<ShowInformationResponse> getAllShows() {
        return cinemaShowService.getAllShows();
    }

    @PostMapping("/addShow")
    @Operation(summary = "Add Show", responses = {
            @ApiResponse(responseCode = "200", description = "Successfully add Show", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
            @ApiResponse(responseCode = "400", description = "This show may contain invalid characters", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<MyApiResponse> addShow(@RequestBody @Valid ShowRequest request) {
        String showId = String.valueOf(cinemaShowService.createShow(request));

        // Trả về thông báo thành công
        return ResponseEntity.ok(new MyApiResponse("Show created successfully", showId));
    }

    @PostMapping("/addListShow")
    @Operation(summary = "Add List Show", responses = {
            @ApiResponse(responseCode = "200", description = "Successfully add List Show", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
            @ApiResponse(responseCode = "400", description = "This show may contain invalid characters", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))

    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public List<MyApiResponse> addListShow(@RequestBody @Valid List<ShowRequest> requests) {
        return cinemaShowService.addListShow(requests);
    }


    @PutMapping("/updateShow/{showId}")
    @Operation(summary = "Update Show", responses = {
            @ApiResponse(responseCode = "200", description = "Successfully update Show", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "Show not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<MyApiResponse> updateShow(@PathVariable(value = "showId") String showId, @Valid @RequestBody ShowRequest request) {
        return ResponseEntity.ok().body(cinemaShowService.updateShow(request, showId));
    }

    @DeleteMapping("/delete/{showId}")
    @Operation(summary = "Delete Show", responses = {
            @ApiResponse(responseCode = "200", description = "Successfully delete Show", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "Show not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> deleteShow( @Valid @PathVariable(value = "showId") String showId) {
        return ResponseEntity.ok().body(cinemaShowService.deleteShow(showId));
    }

    @DeleteMapping("/deleteByHallIdAndMovieId")
    @Operation(summary = "Delete Show", responses = {
            @ApiResponse(responseCode = "200", description = "Successfully delete Show", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "Show not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> deleteShowByHallIdAndMovieId(@RequestBody @Valid ShowRequest request) {
        return ResponseEntity.ok().body(cinemaShowService.deleteShowByHallIdAndFilmId(request));
    }
}
