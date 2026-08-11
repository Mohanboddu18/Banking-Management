package com.bank.onlinebanking.service;

import com.bank.onlinebanking.dto.cheque.*;
import com.bank.onlinebanking.entity.*;
import com.bank.onlinebanking.entity.enums.ChequeStatus;
import com.bank.onlinebanking.entity.enums.NotificationType;
import com.bank.onlinebanking.exception.AccountNotFoundException;
import com.bank.onlinebanking.exception.BankingOperationException;
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
public class ChequeService {

    private final ChequeBookRequestRepository chequeBookRequestRepository;
    private final ChequeBookRepository chequeBookRepository;
    private final AccountRepository accountRepository;
    private final EmployeeRepository employeeRepository;
    private final ReferenceGenerator referenceGenerator;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Transactional
    public ChequeBookResponse requestChequeBook(String username, ChequeRequestDTO req) {
        Account account = accountRepository.findByAccountNumber(req.getAccountNumber())
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + req.getAccountNumber()));

        Customer customer = account.getCustomer();
        if (!customer.getUser().getUsername().equals(username)) {
            throw new BankingOperationException("Access Denied: Account does not belong to user: " + username);
        }

        ChequeBookRequest request = ChequeBookRequest.builder()
                .account(account)
                .numberOfLeaves(req.getNumberOfLeaves())
                .status(ChequeStatus.REQUESTED)
                .build();

        request = chequeBookRequestRepository.save(request);

        auditLogService.logAction(customer.getUser().getId(), username, "ROLE_CUSTOMER", "REQUEST_CHEQUE_BOOK",
                "ChequeBookRequest", request.getId().toString(), null, "SUCCESS",
                "Requested " + req.getNumberOfLeaves() + " leaves cheque book for account " + account.getAccountNumber());

        notificationService.createNotification(customer, "Cheque Book Requested",
                "Your request for a " + req.getNumberOfLeaves() + "-leaf cheque book for account " + account.getAccountNumber() + " is under process.",
                NotificationType.CHEQUE);

        return mapToChequeResponse(request, null);
    }

    @Transactional
    public ChequeBookResponse processChequeRequest(Long requestId, String employeeUsername, ChequeRequestProcessDTO processDTO) {
        ChequeBookRequest request = chequeBookRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Cheque request not found with ID: " + requestId));

        Employee employee = employeeRepository.findByUser_Username(employeeUsername)
                .orElse(null);

        request.setProcessedBy(employee);
        request.setProcessedDate(LocalDateTime.now());
        request.setRemarks(processDTO.getRemarks());

        ChequeBook issuedBook = null;
        Customer customer = request.getAccount().getCustomer();

        if ("APPROVE".equalsIgnoreCase(processDTO.getAction())) {
            request.setStatus(ChequeStatus.ISSUED);

            long startLeaf = 100000L + (long)(Math.random() * 800000L);
            long endLeaf = startLeaf + request.getNumberOfLeaves() - 1;
            String chqNum = referenceGenerator.generateChequeBookNumber();

            issuedBook = ChequeBook.builder()
                    .account(request.getAccount())
                    .request(request)
                    .chequeBookNumber(chqNum)
                    .startLeafNumber(startLeaf)
                    .endLeafNumber(endLeaf)
                    .totalLeaves(request.getNumberOfLeaves())
                    .status(ChequeStatus.ACTIVE)
                    .build();
            issuedBook = chequeBookRepository.save(issuedBook);

            auditLogService.logAction(employee != null ? employee.getUser().getId() : null, employeeUsername, "EMPLOYEE",
                    "APPROVE_CHEQUE_BOOK", "ChequeBook", chqNum, null, "SUCCESS",
                    "Approved and dispatched cheque book " + chqNum + " (" + request.getNumberOfLeaves() + " leaves)");

            notificationService.createNotification(customer, "Cheque Book Dispatched",
                    "Your " + request.getNumberOfLeaves() + "-leaf cheque book (" + chqNum + ") has been approved and issued with leaves " + startLeaf + " to " + endLeaf + ".",
                    NotificationType.CHEQUE);
        } else {
            request.setStatus(ChequeStatus.REJECTED);

            auditLogService.logAction(employee != null ? employee.getUser().getId() : null, employeeUsername, "EMPLOYEE",
                    "REJECT_CHEQUE_BOOK", "ChequeBookRequest", requestId.toString(), null, "SUCCESS",
                    "Rejected cheque request: " + processDTO.getRemarks());

            notificationService.createNotification(customer, "Cheque Book Request Rejected",
                    "Your cheque book request for account " + request.getAccount().getAccountNumber() + " was rejected. Reason: " + processDTO.getRemarks(),
                    NotificationType.CHEQUE);
        }

        chequeBookRequestRepository.save(request);
        return mapToChequeResponse(request, issuedBook);
    }

    @Transactional(readOnly = true)
    public List<ChequeBookResponse> getCustomerChequeRequests(String username) {
        return chequeBookRequestRepository.findAllByAccount_Customer_User_Username(username).stream()
                .map(r -> mapToChequeResponse(r, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChequeBookResponse> getAllPendingChequeRequests() {
        return chequeBookRequestRepository.findAllByStatus(ChequeStatus.REQUESTED).stream()
                .map(r -> mapToChequeResponse(r, null))
                .collect(Collectors.toList());
    }

    private ChequeBookResponse mapToChequeResponse(ChequeBookRequest req, ChequeBook book) {
        ChequeBookResponse.ChequeBookResponseBuilder b = ChequeBookResponse.builder()
                .id(book != null ? book.getId() : null)
                .requestId(req.getId())
                .accountNumber(req.getAccount().getAccountNumber())
                .totalLeaves(req.getNumberOfLeaves())
                .status(req.getStatus().name())
                .requestDate(req.getRequestDate());

        if (book != null) {
            b.chequeBookNumber(book.getChequeBookNumber())
             .startLeafNumber(book.getStartLeafNumber())
             .endLeafNumber(book.getEndLeafNumber())
             .issuedDate(book.getIssuedDate());
        }

        return b.build();
    }
}
