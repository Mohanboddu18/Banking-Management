package com.bank.onlinebanking.controller;

import com.bank.onlinebanking.dto.common.ApiResponse;
import com.bank.onlinebanking.dto.vas.*;
import com.bank.onlinebanking.entity.*;
import com.bank.onlinebanking.service.VASService;
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

import java.util.List;

@RestController
@RequestMapping("/api/vas")
@RequiredArgsConstructor
@Tag(name = "Value Added Services (VAS)", description = "Endpoints for QR Merchant Payments, Telecom Mobile Recharge, and Movie Ticket Booking")
public class VASController {

    private final VASService vasService;

    // ==========================================
    // QR Code Payments
    // ==========================================
    @GetMapping("/qr/merchants")
    @Operation(summary = "Get Verified Bank Merchants")
    public ResponseEntity<ApiResponse<List<Merchant>>> getMerchants() {
        List<Merchant> list = vasService.getAllMerchants();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/qr/pay")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Pay Merchant via QR Code")
    public ResponseEntity<ApiResponse<QRPaymentResponse>> payMerchant(
            @Valid @RequestBody QRPaymentRequest req,
            Authentication authentication,
            HttpServletRequest servletReq) {
        String ip = servletReq.getRemoteAddr();
        QRPaymentResponse response = vasService.payMerchantViaQR(authentication.getName(), req, ip);
        return ResponseEntity.ok(ApiResponse.ok(response, "Payment to " + response.getMerchantName() + " successful!"));
    }

    // ==========================================
    // Mobile Telecom Recharge
    // ==========================================
    @GetMapping("/recharge/operators")
    @Operation(summary = "Get Mobile Telecom Operators")
    public ResponseEntity<ApiResponse<List<MobileOperator>>> getOperators() {
        List<MobileOperator> list = vasService.getAllOperators();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/recharge/plans/{operatorId}")
    @Operation(summary = "Get Recharge Plans for Operator")
    public ResponseEntity<ApiResponse<List<MobileRechargePlan>>> getPlans(@PathVariable Long operatorId) {
        List<MobileRechargePlan> list = vasService.getPlansForOperator(operatorId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/recharge/pay")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Recharge Mobile Balance")
    public ResponseEntity<ApiResponse<RechargeResponse>> rechargeMobile(
            @Valid @RequestBody RechargeRequest req,
            Authentication authentication,
            HttpServletRequest servletReq) {
        String ip = servletReq.getRemoteAddr();
        RechargeResponse response = vasService.rechargeMobile(authentication.getName(), req, ip);
        return ResponseEntity.ok(ApiResponse.ok(response, "Mobile recharge completed successfully!"));
    }

    @GetMapping("/recharge/history")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Get Customer Mobile Recharge History")
    public ResponseEntity<ApiResponse<List<MobileRecharge>>> getRechargeHistory(Authentication authentication) {
        List<MobileRecharge> list = vasService.getCustomerRecharges(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    // ==========================================
    // Movie Ticket Booking
    // ==========================================
    @GetMapping("/movies/locations")
    @Operation(summary = "Get Movie Cinema Locations / Cities")
    public ResponseEntity<ApiResponse<List<Location>>> getLocations() {
        List<Location> list = vasService.getAllLocations();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/movies")
    @Operation(summary = "Get Now Showing Movies")
    public ResponseEntity<ApiResponse<List<Movie>>> getMovies() {
        List<Movie> list = vasService.getAllMovies();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/movies/{movieId}/shows")
    @Operation(summary = "Get Theatre Shows for Movie")
    public ResponseEntity<ApiResponse<List<Show>>> getShows(@PathVariable Long movieId) {
        List<Show> list = vasService.getShowsForMovie(movieId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/movies/shows/{showId}/seats")
    @Operation(summary = "Get Interactive Seat Layout & Booking Status")
    public ResponseEntity<ApiResponse<SeatLayoutResponse>> getSeatLayout(@PathVariable Long showId) {
        SeatLayoutResponse response = vasService.getSeatLayout(showId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/movies/book")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Book Movie Tickets with Real-time Seat Lock")
    public ResponseEntity<ApiResponse<MovieBookingResponse>> bookMovieTickets(
            @Valid @RequestBody MovieBookingRequest req,
            Authentication authentication,
            HttpServletRequest servletReq) {
        String ip = servletReq.getRemoteAddr();
        MovieBookingResponse response = vasService.bookMovieTickets(authentication.getName(), req, ip);
        return new ResponseEntity<>(ApiResponse.ok(response, "Movie tickets booked successfully!"), HttpStatus.CREATED);
    }

    @GetMapping("/movies/my-bookings")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Get Customer Movie Bookings & Digital Tickets")
    public ResponseEntity<ApiResponse<List<MovieBookingResponse>>> getMyBookings(Authentication authentication) {
        List<MovieBookingResponse> list = vasService.getCustomerMovieBookings(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}
