package com.bank.onlinebanking.dto.employee;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogResponse {
    private Long id;
    private Long userId;
    private String username;
    private String role;
    private String action;
    private String entityName;
    private String entityId;
    private String ipAddress;
    private String status;
    private String details;
    private LocalDateTime createdAt;
}
