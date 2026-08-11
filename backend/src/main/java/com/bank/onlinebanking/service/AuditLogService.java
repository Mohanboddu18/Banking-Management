package com.bank.onlinebanking.service;

import com.bank.onlinebanking.dto.employee.AuditLogResponse;
import com.bank.onlinebanking.entity.AuditLog;
import com.bank.onlinebanking.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void logAction(Long userId, String username, String role, String action, String entityName, String entityId, String ipAddress, String status, String details) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .username(username != null ? username : "ANONYMOUS")
                .role(role != null ? role : "SYSTEM")
                .action(action)
                .entityName(entityName)
                .entityId(entityId)
                .ipAddress(ipAddress)
                .status(status)
                .details(details)
                .build();
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getRecentAuditLogs() {
        return auditLogRepository.findTop100ByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private AuditLogResponse mapToResponse(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .userId(log.getUserId())
                .username(log.getUsername())
                .role(log.getRole())
                .action(log.getAction())
                .entityName(log.getEntityName())
                .entityId(log.getEntityId())
                .ipAddress(log.getIpAddress())
                .status(log.getStatus())
                .details(log.getDetails())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
