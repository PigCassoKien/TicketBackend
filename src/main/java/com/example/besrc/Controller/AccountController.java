package com.example.besrc.Controller;

import com.example.besrc.Entities.EnumEntities.ERole;
import com.example.besrc.Exception.BadRequestException;
import com.example.besrc.Exception.ConflictException;
import com.example.besrc.Exception.NotFoundException;
import com.example.besrc.ServerResponse.AccountResponse;
import com.example.besrc.ServerResponse.ErrorResponse;
import com.example.besrc.ServerResponse.MyApiResponse;
import com.example.besrc.Service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/account")
@Tag(name = "Account")
public class AccountController {
    @Autowired
    private AccountService accountService;

    @GetMapping("/admin/all")
    @Operation(summary = "Get all accounts information", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AccountResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(accountService.getAccounts());
    }

    @GetMapping("/admin/{username}/information")
    @Operation(summary = "Get account information by username", responses = {
        @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserDetails.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Account not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> getAccountByUsername(@PathVariable(value = "username") String username) {
        return ResponseEntity.ok(accountService.getAccountByName(username));
    }

    @GetMapping("/admin/search")
    @Operation(
            summary = "Search User by username (Admin is required)",
            responses = {
                    @ApiResponse( responseCode = "200", description = "A list of users.",
                            content = @Content( mediaType = "application/json", schema = @Schema(implementation = AccountResponse.class))),
                    @ApiResponse( responseCode = "401", description = "Invalid token.",
                            content = @Content( mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                    @ApiResponse( responseCode = "403", description = "User do not have permission to get this data.",
                            content = @Content( mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            },
            parameters = {
                    @Parameter( name = "Authorization", in = ParameterIn.HEADER,
                            schema = @Schema(type = "string"), example = "Bearer <token>",
                            required = true
                    )
            }
    )
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> searchUserByUsername(@RequestParam String username) {
        return ResponseEntity.ok(accountService.searchByName(username));
    }

    @DeleteMapping("/admin/delete")
    @Operation(summary = "Delete account by username", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "Account not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public MyApiResponse deleteAccountByUsername(@RequestParam String username) {
        if (!accountService.isUsernameExisted(username)) {
            throw new NotFoundException("User not found");
        }
        if (accountService.accountHaveRole(username, ERole.ADMIN)) {
            throw new BadRequestException("Admin cannot be deleted");
        }
        accountService.deleteAccountByUsername(username);
        return new MyApiResponse("Account deleted successfully", HttpStatus.OK);
    }

    @GetMapping("/superadmin/giveAdmin")
    @Operation(summary = "Give admin role to user", responses = {
            @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "Account not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "User already has admin role", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Invalid token", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public MyApiResponse giveAdmin(@RequestParam String username) {
        if (accountService.isUsernameExisted(username)) {
            if (accountService.accountHaveRole(username, ERole.ADMIN)) {
                throw new ConflictException("User already has admin role");
            }

            accountService.addRoleToAccount(username, ERole.ADMIN);
            return new MyApiResponse("Admin role added successfully", HttpStatus.OK);
        }
        throw new NotFoundException("User not found");
    }


    @GetMapping("/superadmin/removeAdmin")
    @Operation(summary = "Remove admin role from user", responses = {
        @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "Account not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "400", description = "User does not have admin role", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Invalid token", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public MyApiResponse removeAdmin(@RequestParam String username) {
        if (accountService.isUsernameExisted(username)) {
            if (!accountService.accountHaveRole(username, ERole.ADMIN)) {
                throw new ConflictException("User does not have admin role");
            }

            accountService.removeRoleAccount(username, ERole.ADMIN);
            return new MyApiResponse("Admin role removed successfully", HttpStatus.OK);
        }
        throw new NotFoundException("User not found");
    }

    @GetMapping("/getMyAccountInformation")
    @Operation(summary = "Get my account information", responses = {
        @ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AccountResponse.class))),
        @ApiResponse(responseCode = "401", description = "Invalid token", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403",description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    }, parameters = {
            @Parameter(name = "Authorization", in = ParameterIn.HEADER, schema = @Schema(type = "string"), example = "Bearer <token>", required = true)
    })
    //@PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<AccountResponse> getMyAccountInformation(Principal principal) {
        return ResponseEntity.ok(accountService.getAccountByName(principal.getName()));
    }
}
