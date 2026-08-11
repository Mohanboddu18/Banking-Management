package com.bank.onlinebanking.dto.complaint;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ComplaintStatusUpdateRequest {
    @NotBlank(message = "Status is required (OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED)")
    private String status;

    private Long assignedEmployeeId;

    private String resolutionNotes;
}
