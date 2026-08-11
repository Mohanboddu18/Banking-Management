package com.bank.onlinebanking.service;

import com.bank.onlinebanking.dto.complaint.*;
import com.bank.onlinebanking.entity.*;
import com.bank.onlinebanking.entity.enums.*;
import com.bank.onlinebanking.exception.ResourceNotFoundException;
import com.bank.onlinebanking.repository.*;
import com.bank.onlinebanking.util.ReferenceGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final ReferenceGenerator referenceGenerator;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Transactional
    public ComplaintResponse raiseComplaint(String username, ComplaintCreateRequest req) {
        Customer customer = customerRepository.findByUser_Username(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + username));

        ComplaintCategory category;
        try {
            category = ComplaintCategory.valueOf(req.getCategory().toUpperCase());
        } catch (Exception e) {
            category = ComplaintCategory.OTHER;
        }

        ComplaintPriority priority;
        try {
            priority = req.getPriority() != null ? ComplaintPriority.valueOf(req.getPriority().toUpperCase()) : ComplaintPriority.MEDIUM;
        } catch (Exception e) {
            priority = ComplaintPriority.MEDIUM;
        }

        String ticket = referenceGenerator.generateComplaintTicket();

        Complaint complaint = Complaint.builder()
                .complaintTicket(ticket)
                .customer(customer)
                .category(category)
                .subject(req.getSubject())
                .description(req.getDescription())
                .priority(priority)
                .status(ComplaintStatus.OPEN)
                .build();

        complaint = complaintRepository.save(complaint);

        auditLogService.logAction(customer.getUser().getId(), username, "ROLE_CUSTOMER", "RAISE_COMPLAINT",
                "Complaint", ticket, null, "SUCCESS",
                "Raised grievance (" + category.name() + "): " + req.getSubject());

        notificationService.createNotification(customer, "Complaint Ticket Registered",
                "Your grievance ticket #" + ticket + " (" + req.getSubject() + ") has been received. Our Customer Support Desk will investigate shortly.",
                NotificationType.COMPLAINT);

        return mapToComplaintResponse(complaint);
    }

    @Transactional
    public ComplaintResponse updateComplaintStatus(Long complaintId, String employeeUsername, ComplaintStatusUpdateRequest req) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));

        ComplaintStatus newStatus = ComplaintStatus.valueOf(req.getStatus().toUpperCase());
        complaint.setStatus(newStatus);

        if (req.getAssignedEmployeeId() != null) {
            employeeRepository.findById(req.getAssignedEmployeeId()).ifPresent(complaint::setAssignedEmployee);
        } else if (complaint.getAssignedEmployee() == null) {
            employeeRepository.findByUser_Username(employeeUsername).ifPresent(complaint::setAssignedEmployee);
        }

        if (req.getResolutionNotes() != null && !req.getResolutionNotes().isEmpty()) {
            complaint.setResolutionNotes(req.getResolutionNotes());
        }

        if (newStatus == ComplaintStatus.RESOLVED || newStatus == ComplaintStatus.CLOSED) {
            complaint.setResolvedAt(LocalDateTime.now());
        }

        complaint = complaintRepository.save(complaint);

        Customer customer = complaint.getCustomer();
        auditLogService.logAction(null, employeeUsername, "EMPLOYEE", "UPDATE_COMPLAINT",
                "Complaint", complaint.getComplaintTicket(), null, "SUCCESS",
                "Complaint #" + complaint.getComplaintTicket() + " updated to " + newStatus.name());

        notificationService.createNotification(customer, "Complaint Status Updated",
                "Your grievance ticket #" + complaint.getComplaintTicket() + " status is now: " + newStatus.name() + (req.getResolutionNotes() != null ? " Notes: " + req.getResolutionNotes() : ""),
                NotificationType.COMPLAINT);

        return mapToComplaintResponse(complaint);
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getCustomerComplaints(String username) {
        return complaintRepository.findAllByCustomer_User_Username(username).stream()
                .map(this::mapToComplaintResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepository.findAll().stream()
                .map(this::mapToComplaintResponse)
                .collect(Collectors.toList());
    }

    private ComplaintResponse mapToComplaintResponse(Complaint c) {
        return ComplaintResponse.builder()
                .id(c.getId())
                .complaintTicket(c.getComplaintTicket())
                .customerId(c.getCustomer().getCustomerId())
                .customerName(c.getCustomer().getFullName())
                .category(c.getCategory().name())
                .subject(c.getSubject())
                .description(c.getDescription())
                .priority(c.getPriority().name())
                .status(c.getStatus().name())
                .assignedEmployeeName(c.getAssignedEmployee() != null ? c.getAssignedEmployee().getFullName() : "Unassigned")
                .resolutionNotes(c.getResolutionNotes())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .resolvedAt(c.getResolvedAt())
                .build();
    }
}
