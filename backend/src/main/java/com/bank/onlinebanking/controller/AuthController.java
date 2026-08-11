package com.bank.onlinebanking.controller;

import com.bank.onlinebanking.dto.auth.*;
import com.bank.onlinebanking.dto.common.ApiResponse;
import com.bank.onlinebanking.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication & User Management", description = "Endpoints for Customer Registration, User Login, Password & PIN Management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new Customer & Open Bank Account", description = "Creates User, Customer KYC record, and default Savings/Current account with initial deposit.")
    public ResponseEntity<ApiResponse<JwtResponse>> registerCustomer(@Valid @RequestBody RegisterCustomerRequest req, HttpServletRequest servletReq) {
        String ip = servletReq.getRemoteAddr();
        JwtResponse response = authService.registerCustomer(req, ip);
        return new ResponseEntity<>(ApiResponse.ok(response, "Customer registration & account opening successful!"), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "User Login", description = "Authenticates Customer, Employee, or Bank Manager and returns JWT token.")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest req, HttpServletRequest servletReq) {
        String ip = servletReq.getRemoteAddr();
        JwtResponse response = authService.login(req, ip);
        return ResponseEntity.ok(ApiResponse.ok(response, "Login successful!"));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get Authenticated User Profile", description = "Retrieves profile details of current logged-in user.")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser(Authentication authentication) {
        UserProfileResponse profile = authService.getCurrentUserProfile(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PostMapping("/set-pin")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Set or Change Transaction PIN", description = "Sets or updates the 4-6 digit financial transaction PIN.")
    public ResponseEntity<ApiResponse<String>> setOrChangePin(@Valid @RequestBody SetPinRequest req, Authentication authentication) {
        authService.setOrChangePin(authentication.getName(), req);
        return ResponseEntity.ok(ApiResponse.ok("Transaction PIN updated successfully!"));
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Change Login Password", description = "Updates user password after verifying current password.")
    public ResponseEntity<ApiResponse<String>> changePassword(@Valid @RequestBody ChangePasswordRequest req, Authentication authentication) {
        authService.changePassword(authentication.getName(), req);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully!"));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot Password & Self-Service Password Reset", description = "Resets user password using username, email, account, or mobile with verification.")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req, HttpServletRequest servletReq) {
        String ip = servletReq.getRemoteAddr();
        authService.resetForgottenPassword(req, ip);
        return ResponseEntity.ok(ApiResponse.ok("Password has been reset successfully! You can now log in with your new password."));
    }
}
