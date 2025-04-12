package com.example.besrc.Controller;

import com.example.besrc.ServerResponse.ErrorResponse;
import com.example.besrc.ServerResponse.FeedBackResponse;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.Service.FeedbackService;
import com.example.besrc.requestClient.FeedBackRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@Tag(name = "FeedBack", description = "FeedBack API")
public class FeedBackController {
    @Autowired
    private FeedbackService feedbackService;

    @PostMapping("/add")
    @Operation(summary = "Add FeedBack", responses = {
            @ApiResponse(responseCode = "200", description = "Add FeedBack Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = FeedBackResponse.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public FeedBackResponse addFeedBack(Principal principal, @RequestBody FeedBackRequest request) {
        return feedbackService.addFeedBack(principal.getName(), request);
    }

    @GetMapping("/getOne/{feedbackId}")
    @Operation(summary = "Get One FeedBack", responses = {
        @ApiResponse(responseCode = "200", description = "Get FeedBack Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = FeedBackResponse.class))),
            @ApiResponse(responseCode = "404", description = "FeedBack is not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public FeedBackResponse getFeedBack(Principal principal, @PathVariable(value = "feedbackId") String feedbackId) {
        return feedbackService.getAFeedBack(principal.getName(), feedbackId);
    }

    @GetMapping("/getAll/{filmId}")
    @Operation(summary = "Get All FeedBack", responses = {
            @ApiResponse(responseCode = "200", description = "Get FeedBack Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = FeedBackResponse.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Film is not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))

    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public List<FeedBackResponse> getAllFilmFeedBack(@PathVariable(value = "filmId") Long filmId) {
        return feedbackService.getAllFeedBacksFromFilmId(filmId);
    }

    @GetMapping("/getAllUserFeedBack/{accountId}")
    @Operation(summary = "Get All User FeedBack", responses = {
        @ApiResponse(responseCode = "200", description = "Get FeedBack Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = FeedBackResponse.class))),
        @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "User is not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public List<FeedBackResponse> getAllUserFeedBack(@PathVariable(value = "accountId") String accountId) {
        return feedbackService.getAllFeedBacksByAccountId(accountId);
    }

    @GetMapping("/getAllUsernameFeedBack/{username}")
    @Operation(summary = "Get All Username FeedBack", responses = {
        @ApiResponse(responseCode = "200", description = "Get FeedBack Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = FeedBackResponse.class))),
            @ApiResponse(responseCode = "404", description = "User is not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public List<FeedBackResponse> getAllUsernameFeedBack(@PathVariable(value = "username") String username) {
        return feedbackService.getAllFeedBacksByUserName(username);
    }

    @GetMapping("/getAll")
    @Operation(summary = "Get All FeedBack", responses = {
            @ApiResponse(responseCode = "200", description = "Get FeedBack Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = FeedBackResponse.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter (name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public List<FeedBackResponse> getAllFeedBacks() {
        return feedbackService.getAllFeedBacks();
    }

    @PutMapping("/edit/{feedbackId}")
    @Operation(summary = "Edit FeedBack", responses = {
        @ApiResponse(responseCode = "200", description = "Edit FeedBack Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = FeedBackResponse.class))),
        @ApiResponse(responseCode = "404", description = "FeedBack is not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public FeedBackResponse editUsernameFeedBack(Principal principal, @PathVariable(value = "feedbackId") String feedbackId, @Valid @RequestBody FeedBackRequest request) {
        return feedbackService.editFeedBack(principal.getName(), feedbackId, request);
    }

    @DeleteMapping("/delete/{feedbackId}")
    @Operation(summary = "Delete FeedBack", responses = {
        @ApiResponse(responseCode = "200", description = "Delete FeedBack Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "Username is not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public MyApiResponse deleteUsernameFeedBack(Principal principal, @PathVariable(value = "feedbackId") String feedbackId) {
        return feedbackService.deleteFeedBackByUserName(principal.getName(), feedbackId);
    }

    @DeleteMapping("/Admin/delete/{feedbackId}")
    @Operation(summary = "Delete FeedBack By Id", responses = {
        @ApiResponse(responseCode = "200", description = "Delete FeedBack Successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "Feedback is not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public MyApiResponse deleteFeedBackById(@PathVariable(value = "feedbackId") String feedbackId) {
        return feedbackService.deleteFeedBackById(feedbackId);
    }
}
