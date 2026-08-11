package com.bank.onlinebanking.service;

import com.bank.onlinebanking.dto.employee.*;
import com.bank.onlinebanking.entity.*;
import com.bank.onlinebanking.entity.enums.*;
import com.bank.onlinebanking.exception.BankingOperationException;
import com.bank.onlinebanking.exception.ResourceNotFoundException;
import com.bank.onlinebanking.repository.*;
import com.bank.onlinebanking.util.ReferenceGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ManagerService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LoanRepository loanRepository;
    private final DebitCardRepository debitCardRepository;
    private final ChequeBookRequestRepository chequeBookRequestRepository;
    private final ComplaintRepository complaintRepository;
    private final BankChargeRepository bankChargeRepository;
    private final PasswordEncoder passwordEncoder;
    private final ReferenceGenerator referenceGenerator;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    // ==========================================
    // 1. EMPLOYEE MANAGEMENT
    // ==========================================
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::mapToEmployeeResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public EmployeeResponse createEmployee(EmployeeCreateRequest req, String managerUsername) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new BankingOperationException("Username already exists!");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BankingOperationException("Email already exists!");
        }

        RoleName rName;
        try {
            rName = RoleName.valueOf(req.getRoleName());
        } catch (Exception e) {
            rName = RoleName.ROLE_EMPLOYEE_OPERATIONS;
        }
        final RoleName roleName = rName;

        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).description(req.getDepartment()).build()));

        User user = User.builder()
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .email(req.getEmail())
                .mobile(req.getMobile())
                .userType("EMPLOYEE")
                .enabled(true)
                .accountNonLocked(true)
                .roles(Set.of(role))
                .build();
        user = userRepository.save(user);

        int count = (int) employeeRepository.count() + 1;
        String empId = referenceGenerator.generateEmployeeId(count);

        Employee employee = Employee.builder()
                .user(user)
                .employeeId(empId)
                .fullName(req.getFullName())
                .roleDesignation(req.getDepartment() + " Officer")
                .department(req.getDepartment())
                .joiningDate(req.getJoiningDate() != null ? req.getJoiningDate() : LocalDate.now())
                .status("ACTIVE")
                .build();
        employee = employeeRepository.save(employee);

        auditLogService.logAction(null, managerUsername, "ROLE_MANAGER", "CREATE_EMPLOYEE",
                "Employee", empId, null, "SUCCESS", "Created employee " + req.getFullName() + " (" + roleName.name() + ")");

        return mapToEmployeeResponse(employee);
    }

    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeUpdateRequest req, String managerUsername) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));

        if (req.getFullName() != null) employee.setFullName(req.getFullName());
        if (req.getDepartment() != null) employee.setDepartment(req.getDepartment());
        if (req.getStatus() != null) employee.setStatus(req.getStatus());

        User user = employee.getUser();
        if (req.getEmail() != null) user.setEmail(req.getEmail());
        if (req.getMobile() != null) user.setMobile(req.getMobile());
        if (req.getEnabled() != null) user.setEnabled(req.getEnabled());

        if (req.getRoleName() != null) {
            RoleName rName = RoleName.valueOf(req.getRoleName());
            Role role = roleRepository.findByName(rName)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(rName).build()));
            user.setRoles(Set.of(role));
        }

        userRepository.save(user);
        employee = employeeRepository.save(employee);

        auditLogService.logAction(null, managerUsername, "ROLE_MANAGER", "UPDATE_EMPLOYEE",
                "Employee", employee.getEmployeeId(), null, "SUCCESS", "Updated employee " + employee.getEmployeeId());

        return mapToEmployeeResponse(employee);
    }

    // ==========================================
    // 2. CUSTOMER / ACCOUNT STATUS MANAGEMENT
    // ==========================================
    @Transactional
    public void updateAccountStatus(Long accountId, String newStatusStr, String managerUsername) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + accountId));

        AccountStatus newStatus = AccountStatus.valueOf(newStatusStr.toUpperCase());
        account.setStatus(newStatus);
        accountRepository.save(account);

        Customer customer = account.getCustomer();
        auditLogService.logAction(null, managerUsername, "ROLE_MANAGER", "UPDATE_ACCOUNT_STATUS",
                "Account", account.getAccountNumber(), null, "SUCCESS",
                "Account " + account.getAccountNumber() + " status changed to: " + newStatus.name());

        notificationService.createNotification(customer, "Account Status Updated",
                "Your account " + account.getAccountNumber() + " status is now " + newStatus.name() + ".",
                NotificationType.SECURITY);
    }

    // ==========================================
    // 3. BANK CHARGES CONFIGURATION
    // ==========================================
    @Transactional(readOnly = true)
    public List<BankChargeDTO> getAllBankCharges() {
        return bankChargeRepository.findAll().stream()
                .map(this::mapToBankChargeDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BankChargeDTO updateBankCharge(Long id, BankChargeDTO dto, String managerUsername) {
        BankCharge charge = bankChargeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bank Charge rule not found: " + id));

        charge.setChargeName(dto.getChargeName());
        charge.setAmount(dto.getAmount());
        if (dto.getMinBalanceThreshold() != null) charge.setMinBalanceThreshold(dto.getMinBalanceThreshold());
        charge.setActive(dto.isActive());

        charge = bankChargeRepository.save(charge);

        auditLogService.logAction(null, managerUsername, "ROLE_MANAGER", "UPDATE_BANK_CHARGE",
                "BankCharge", id.toString(), null, "SUCCESS",
                "Updated rule " + charge.getChargeName() + " to ₹" + charge.getAmount());

        return mapToBankChargeDTO(charge);
    }

    // ==========================================
    // 4. MANAGER DASHBOARD ANALYTICS & KPIS
    // ==========================================
    @Transactional(readOnly = true)
    public ManagerDashboardStatsDTO getDashboardStats() {
        long totalCustomers = customerRepository.count();
        List<Account> allAccounts = accountRepository.findAll();

        long activeAccounts = allAccounts.stream().filter(a -> a.getStatus() == AccountStatus.ACTIVE).count();
        long suspendedAccounts = allAccounts.stream().filter(a -> a.getStatus() == AccountStatus.SUSPENDED).count();
        long pendingApprovalAccounts = allAccounts.stream().filter(a -> a.getStatus() == AccountStatus.PENDING_APPROVAL).count();

        BigDecimal totalBankDeposits = allAccounts.stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Transactions
        List<Transaction> allTxns = transactionRepository.findAll();
        long totalTransactions = allTxns.size();

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        List<Transaction> todayTxns = allTxns.stream()
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isAfter(todayStart))
                .toList();

        long todayTransactions = todayTxns.size();
        BigDecimal todayCreditVolume = todayTxns.stream()
                .filter(t -> t.getToAccount() != null)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal todayDebitVolume = todayTxns.stream()
                .filter(t -> t.getFromAccount() != null)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Loans
        List<Loan> allLoans = loanRepository.findAll();
        long pendingLoans = allLoans.stream().filter(l -> l.getStatus() == LoanStatus.APPLIED || l.getStatus() == LoanStatus.UNDER_REVIEW).count();
        long activeLoans = allLoans.stream().filter(l -> l.getStatus() == LoanStatus.ACTIVE).count();

        BigDecimal totalDisbursedLoanAmount = allLoans.stream()
                .filter(l -> l.getApprovedAmount() != null)
                .map(Loan::getApprovedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalOutstanding = allLoans.stream()
                .filter(l -> l.getStatus() == LoanStatus.ACTIVE && l.getRemainingPrincipal() != null)
                .map(Loan::getRemainingPrincipal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Cards, Cheques, Complaints
        long activeDebitCards = debitCardRepository.count();
        long pendingCheques = chequeBookRequestRepository.findAllByStatus(ChequeStatus.REQUESTED).size();

        List<Complaint> allComplaints = complaintRepository.findAll();
        long openComplaints = allComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.OPEN).count();
        long inProgressComplaints = allComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.IN_PROGRESS || c.getStatus() == ComplaintStatus.ASSIGNED).count();
        long resolvedComplaints = allComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.RESOLVED || c.getStatus() == ComplaintStatus.CLOSED).count();

        // Account & Loan distribution maps
        Map<String, Long> accountTypeDistribution = allAccounts.stream()
                .collect(Collectors.groupingBy(a -> a.getAccountType().getName(), Collectors.counting()));

        Map<String, Long> loanTypeDistribution = allLoans.stream()
                .collect(Collectors.groupingBy(l -> l.getLoanType().getName(), Collectors.counting()));

        // 6 Month Trend Mock Data
        List<ManagerDashboardStatsDTO.MonthlyTrend> trends = new ArrayList<>();
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MMM yyyy");
        for (int i = 5; i >= 0; i--) {
            LocalDate m = LocalDate.now().minusMonths(i);
            trends.add(ManagerDashboardStatsDTO.MonthlyTrend.builder()
                    .month(m.format(monthFmt))
                    .deposits(BigDecimal.valueOf(150000 + (i * 20000) + (Math.random() * 30000)))
                    .withdrawals(BigDecimal.valueOf(80000 + (i * 12000) + (Math.random() * 15000)))
                    .transfers(BigDecimal.valueOf(60000 + (i * 10000) + (Math.random() * 10000)))
                    .build());
        }

        return ManagerDashboardStatsDTO.builder()
                .totalCustomers(totalCustomers)
                .activeAccounts(activeAccounts)
                .suspendedAccounts(suspendedAccounts)
                .pendingApprovalAccounts(pendingApprovalAccounts)
                .totalBankDeposits(totalBankDeposits)
                .totalTransactions(totalTransactions)
                .todayTransactions(todayTransactions)
                .todayCreditVolume(todayCreditVolume)
                .todayDebitVolume(todayDebitVolume)
                .pendingLoanApplications(pendingLoans)
                .activeLoans(activeLoans)
                .totalDisbursedLoanAmount(totalDisbursedLoanAmount)
                .totalOutstandingLoanAmount(totalOutstanding)
                .activeDebitCards(activeDebitCards)
                .pendingChequeRequests(pendingCheques)
                .openComplaints(openComplaints)
                .inProgressComplaints(inProgressComplaints)
                .resolvedComplaints(resolvedComplaints)
                .accountTypeDistribution(accountTypeDistribution)
                .loanTypeDistribution(loanTypeDistribution)
                .monthlyTrends(trends)
                .build();
    }

    private EmployeeResponse mapToEmployeeResponse(Employee e) {
        String roleName = e.getUser().getRoles().isEmpty() ? "ROLE_EMPLOYEE_OPERATIONS" : e.getUser().getRoles().iterator().next().getName().name();
        return EmployeeResponse.builder()
                .id(e.getId())
                .userId(e.getUser().getId())
                .employeeId(e.getEmployeeId())
                .username(e.getUser().getUsername())
                .fullName(e.getFullName())
                .email(e.getUser().getEmail())
                .mobile(e.getUser().getMobile())
                .roleDesignation(e.getRoleDesignation())
                .roleName(roleName)
                .department(e.getDepartment())
                .joiningDate(e.getJoiningDate())
                .status(e.getStatus())
                .enabled(e.getUser().isEnabled())
                .createdAt(e.getCreatedAt())
                .build();
    }

    private BankChargeDTO mapToBankChargeDTO(BankCharge c) {
        return BankChargeDTO.builder()
                .id(c.getId())
                .chargeName(c.getChargeName())
                .chargeType(c.getChargeType().name())
                .amount(c.getAmount())
                .accountTypeId(c.getAccountType() != null ? c.getAccountType().getId() : null)
                .accountTypeCode(c.getAccountType() != null ? c.getAccountType().getCode() : "ALL")
                .minBalanceThreshold(c.getMinBalanceThreshold())
                .frequency(c.getFrequency().name())
                .active(c.isActive())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
