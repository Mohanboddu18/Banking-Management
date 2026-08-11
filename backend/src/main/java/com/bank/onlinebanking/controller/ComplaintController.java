package com.bank.onlinebanking.controller;

import com.bank.onlinebanking.dto.common.ApiResponse;
import com.bank.onlinebanking.dto.complaint.*;
import com.bank.onlinebanking.service.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
@Tag(name = "Customer Complaints & Support", description = "Endpoints for Grievance Ticketing and Resolution")
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Raise a Customer Complaint / Ticket")
    public ResponseEntity<ApiResponse<ComplaintResponse>> raiseComplaint(
            @Valid @RequestBody ComplaintCreateRequest req,
            Authentication authentication) {
        ComplaintResponse response = complaintService.raiseComplaint(authentication.getName(), req);
        return new ResponseEntity<>(ApiResponse.ok(response, "Complaint ticket #" + response.getComplaintTicket() + " registered successfully!"), HttpStatus.CREATED);
    }

    @GetMapping("/my-complaints")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Get Customer Complaint History")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getMyComplaints(Authentication authentication) {
        List<ComplaintResponse> list = complaintService.getCustomerComplaints(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_EMPLOYEE_CUSTOMER_SERVICE', 'ROLE_EMPLOYEE_ASST_MANAGER', 'ROLE_ADMIN')")
    @Operation(summary = "Get All Complaints for Support Desk")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getAllComplaints() {
        List<ComplaintResponse> list = complaintService.getAllComplaints();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_EMPLOYEE_CUSTOMER_SERVICE', 'ROLE_EMPLOYEE_ASST_MANAGER', 'ROLE_ADMIN')")
    @Operation(summary = "Update Complaint Status / Assign / Resolve")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintStatusUpdateRequest req,
            Authentication authentication) {
        ComplaintResponse response = complaintService.updateComplaintStatus(id, authentication.getName(), req);
        return ResponseEntity.ok(ApiResponse.ok(response, "Complaint status updated to " + response.getStatus()));
    }
}
