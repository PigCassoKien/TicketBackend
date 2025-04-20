package com.example.besrc.Controller;

import com.example.besrc.ServerResponse.ErrorResponse;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.ServerResponse.PaymentResponse;
import com.example.besrc.Service.PaymentService;
import com.example.besrc.requestClient.HashRequest;
import com.example.besrc.requestClient.PaymentRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/payment")
@Tag(name = "Payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("create")
    @Operation(hidden = true, summary = "Create payment", responses = {
            @ApiResponse(responseCode = "200", description = "Create Payment Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = PaymentResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "This Ticket not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createPayment(Principal principal, @Valid @RequestBody PaymentRequest request, HttpServletRequest httpServletRequest) {
        return ResponseEntity.ok().body(paymentService.create(principal.getName(), request, httpServletRequest.getRemoteAddr()));
    }


    @GetMapping("getPaymentById/{paymentId}")
    @Operation(summary = "Get Payment By Id", responses = {
            @ApiResponse(responseCode = "200", description = "Get Payment Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = PaymentResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "This Payment not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getPaymentById(Principal principal, @PathVariable(value = "paymentId") @Valid String paymentId) {
        return ResponseEntity.ok().body(paymentService.getFromId(principal.getName(), paymentId));

    }

    @PostMapping("/verify/{paymentId}")
    @Operation(summary = "Verify Id Payment", responses = {
            @ApiResponse(responseCode = "200",description = "Verify Payment Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "This Payment not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> verifyPaymentById(Principal principal, @PathVariable(value = "paymentId") @Valid String paymentId) {
        return ResponseEntity.ok().body(paymentService.verifyPayment(principal.getName(), paymentId));
    }

    @GetMapping("/getAllByUserName")
    @Operation(summary = "Get All Payment By UserName", responses = {
            @ApiResponse(responseCode = "200",description = "Get All Payment Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = PaymentResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getAllPaymentByUserName(Principal principal) {
        return ResponseEntity.ok().body(paymentService.getAllPaymentsOfUser(principal.getName()));

    }

    @PostMapping("/createHash")
    @Operation(hidden = true)
    public ResponseEntity<?> getHash(@RequestBody @Valid HashRequest request) {
        return ResponseEntity.ok().body(paymentService.createHash(request));
    }

    @GetMapping("/order-complete")
    @Operation(summary = "Handle VNPay Return", responses = {
            @ApiResponse(responseCode = "200",description = "Handle VNPay Return Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> handleVNPayReturn(HttpServletRequest request) {
        return ResponseEntity.ok().body(paymentService.handleVNPayReturn(request));
    }
}
