package com.example.besrc.Controller;

import com.example.besrc.Entities.Hall;
import com.example.besrc.ServerResponse.ErrorResponse;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.ServerResponse.SeatResponse;
import com.example.besrc.Service.HallService;
import com.example.besrc.Service.SeatService;
import com.example.besrc.requestClient.EditSeatRequest;
import com.example.besrc.requestClient.HallRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/hall")
@Tag(name = "Hall Endpoint")
@CrossOrigin(origins = "*")
public class HallController {

    private final HallService hallService;
    private final SeatService seatService;

    public HallController(HallService hallService, SeatService seatService) {
        this.hallService = hallService;
        this.seatService = seatService;
    }

    @GetMapping("/{hallId}")
    @Operation(summary = "Get Hall by ID", responses = {
        @ApiResponse(responseCode = "200", description = "Get Hall Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Hall.class))),
        @ApiResponse(responseCode = "404", description = "Hall is not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
        @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> getById (@Valid @PathVariable(value = "hallId") String hallId) {
        return ResponseEntity.ok(hallService.getHallById(hallId));
    }

    @GetMapping("/all")
    @Operation(summary = "Get All Hall", responses = {
        @ApiResponse(responseCode = "200", description = "Get All Hall Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Hall.class))),
        @ApiResponse(responseCode = "404", description = "Hall is not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(hallService.getAll());
    }

    @PostMapping(value = "/create", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create Hall", responses = {
        @ApiResponse(responseCode = "200", description = "Create Hall Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
        @ApiResponse(responseCode = "400", description = "This hall is existed or contains invalid characters", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
        @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> createHall(@Valid @RequestBody HallRequest request) {
        System.out.println("Received request: " + request);
        if (request == null || request.getHallName() == null || request.getHallName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Hall name is required!");
        }

        return ResponseEntity.ok().body(hallService.newHall(new Hall(request)));
    }


    @DeleteMapping("/delete/{hallId}")
    @Operation(summary = "Delete Hall", responses = {
        @ApiResponse(responseCode = "200", description = "Delete Hall Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
        @ApiResponse(responseCode = "404", description = "Hall is not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> deleteHall(@PathVariable(value = "hallId") String hallId) {
        return ResponseEntity.ok().body(hallService.removeHall(hallId));
    }

    @PutMapping("/update/{hallId}")
    @Operation(summary = "Update Hall", responses = {
        @ApiResponse(responseCode = "200", description = "Update Hall Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
        @ApiResponse(responseCode = "404", description = "Hall is not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "400", description = "This hall may contain invalid characters", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @Transactional
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> updateHall(@PathVariable(value = "hallId") String hallId, @Valid @RequestBody HallRequest request) {
        return ResponseEntity.ok().body(hallService.updateHall(hallId, request));
    }

}
