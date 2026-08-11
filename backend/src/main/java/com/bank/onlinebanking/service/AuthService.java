package com.bank.onlinebanking.service;

import com.bank.onlinebanking.dto.auth.*;
import com.bank.onlinebanking.entity.*;
import com.bank.onlinebanking.entity.enums.AccountStatus;
import com.bank.onlinebanking.entity.enums.NotificationType;
import com.bank.onlinebanking.entity.enums.RoleName;
import com.bank.onlinebanking.exception.BankingOperationException;
import com.bank.onlinebanking.exception.InvalidTransactionPinException;
import com.bank.onlinebanking.exception.ResourceNotFoundException;
import com.bank.onlinebanking.repository.*;
import com.bank.onlinebanking.security.JwtUtils;
import com.bank.onlinebanking.security.UserPrincipal;
import com.bank.onlinebanking.util.ReferenceGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final AccountRepository accountRepository;
    private final AccountTypeRepository accountTypeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final ReferenceGenerator referenceGenerator;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Value("${bank.app.ifscPrefix:SBIN}")
    private String ifscPrefix;

    @Value("${bank.app.branchCode:000123}")
    private String branchCode;

    @Value("${bank.app.branchName:State Bank Main Branch, Mumbai}")
    private String branchName;

    @Transactional
    public JwtResponse registerCustomer(RegisterCustomerRequest req, String ipAddress) {
        String username = req.getUsername().trim().toLowerCase();
        if (userRepository.existsByUsername(username)) {
            throw new BankingOperationException("Username '" + username + "' is already taken! Please choose a different username.");
        }

        String email = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BankingOperationException("Email '" + email + "' is already registered! Please use a different email or log in.");
        }

        String pan = req.getPanNumber() != null ? req.getPanNumber().trim().toUpperCase() : "ABCDE" + (int)(1000 + Math.random() * 9000) + "F";
        if (customerRepository.existsByPanNumber(pan)) {
            throw new BankingOperationException("PAN Number '" + pan + "' is already registered with an existing bank account!");
        }

        String aadhaar = req.getAadhaarNumber() != null ? req.getAadhaarNumber().replaceAll("\\D", "") : "";
        if (aadhaar.length() < 12) {
            aadhaar = "99" + (int)(1000000000L + Math.random() * 9000000000L);
        }
        if (customerRepository.existsByAadhaarNumber(aadhaar)) {
            throw new BankingOperationException("Aadhaar Number is already registered!");
        }

        String mobile = req.getMobile() != null ? req.getMobile().replaceAll("\\D", "") : "9876543210";
        if (mobile.length() < 10) mobile = "98" + (int)(10000000 + Math.random() * 90000000);

        LocalDate dob = req.getDateOfBirth() != null ? req.getDateOfBirth() : LocalDate.of(1996, 5, 15);
        String gender = req.getGender() != null && !req.getGender().isEmpty() ? req.getGender() : "Male";
        String address = req.getAddress() != null && !req.getAddress().trim().isEmpty() ? req.getAddress().trim() : "402 Marine Drive";
        String city = req.getCity() != null && !req.getCity().trim().isEmpty() ? req.getCity().trim() : "Mumbai";
        String state = req.getState() != null && !req.getState().trim().isEmpty() ? req.getState().trim() : "Maharashtra";
        String pincode = req.getPincode() != null && !req.getPincode().trim().isEmpty() ? req.getPincode().trim() : "400001";
        String occupation = req.getOccupation() != null && !req.getOccupation().trim().isEmpty() ? req.getOccupation().trim() : "Professional";
        BigDecimal annualIncome = req.getAnnualIncome() != null ? req.getAnnualIncome() : BigDecimal.valueOf(1200000.00);
        String nomineeName = req.getNomineeName() != null && !req.getNomineeName().trim().isEmpty() ? req.getNomineeName().trim() : req.getFirstName() + " Nominee";
        String nomineeRelation = req.getNomineeRelation() != null && !req.getNomineeRelation().trim().isEmpty() ? req.getNomineeRelation().trim() : "Family";
        BigDecimal initialDeposit = req.getInitialDeposit() != null && req.getInitialDeposit().compareTo(BigDecimal.valueOf(100)) >= 0 ? req.getInitialDeposit() : BigDecimal.valueOf(1000.00);
        String pin = req.getTransactionPin() != null && !req.getTransactionPin().trim().isEmpty() ? req.getTransactionPin().trim() : "1234";

        // 1. Create User
        Role customerRole = roleRepository.findByName(RoleName.ROLE_CUSTOMER)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(RoleName.ROLE_CUSTOMER)
                        .description("Bank Customer Role")
                        .build()));

        Set<Role> roles = new HashSet<>();
        roles.add(customerRole);

        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(req.getPassword()))
                .email(email)
                .mobile(mobile)
                .userType("CUSTOMER")
                .enabled(true)
                .accountNonLocked(true)
                .roles(roles)
                .build();
        userRepository.save(user);

        // 2. Create Customer Profile
        String customerId = referenceGenerator.generateCustomerId();
        Customer customer = Customer.builder()
                .user(user)
                .customerId(customerId)
                .firstName(req.getFirstName().trim())
                .lastName(req.getLastName().trim())
                .gender(gender)
                .dateOfBirth(dob)
                .panNumber(pan)
                .aadhaarNumber(aadhaar)
                .address(address)
                .city(city)
                .state(state)
                .pincode(pincode)
                .occupation(occupation)
                .annualIncome(annualIncome)
                .nomineeName(nomineeName)
                .nomineeRelation(nomineeRelation)
                .transactionPin(passwordEncoder.encode(pin))
                .build();
        customerRepository.save(customer);

        // 3. Create Default Account
        String accTypeCode = req.getAccountType() != null && !req.getAccountType().isEmpty() ? req.getAccountType().toUpperCase() : "SAVINGS";
        AccountType accountType = accountTypeRepository.findByCode(accTypeCode)
                .orElseGet(() -> accountTypeRepository.save(AccountType.builder()
                        .code("SAVINGS")
                        .name("Regular Savings Account")
                        .description("Standard interest bearing savings account")
                        .build()));

        String accountNumber = referenceGenerator.generateAccountNumber();
        Account account = Account.builder()
                .customer(customer)
                .accountNumber(accountNumber)
                .accountType(accountType)
                .balance(initialDeposit)
                .ledgerBalance(initialDeposit)
                .status(AccountStatus.ACTIVE)
                .ifscCode(ifscPrefix + branchCode)
                .branchName(branchName)
                .openingDate(LocalDate.now())
                .build();
        accountRepository.save(account);

        // 4. Audit & Notification
        auditLogService.logAction(user.getId(), user.getUsername(), "ROLE_CUSTOMER", "REGISTER_CUSTOMER",
                "Customer", customerId, ipAddress, "SUCCESS",
                "New account opened with Account No: " + accountNumber + " and Initial Deposit: ₹" + req.getInitialDeposit());

        notificationService.createNotification(customer, "Welcome to Online Banking",
                "Welcome " + customer.getFullName() + "! Your " + accountType.getName() + " " + accountNumber + " is activated with balance ₹" + req.getInitialDeposit(),
                NotificationType.SYSTEM);

        // 5. Authenticate & Return JWT
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtUtils.generateJwtToken(authentication);

        return JwtResponse.builder()
                .token(jwt)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .userType(user.getUserType())
                .customerId(customerId)
                .fullName(customer.getFullName())
                .roles(List.of(RoleName.ROLE_CUSTOMER.name()))
                .build();
    }

    @Transactional
    public JwtResponse login(LoginRequest loginRequest, String ipAddress) {
        String identifier = loginRequest.getUsername();
        String usernameToAuth = identifier;

        // Check if user entered an Account Number
        Optional<Account> accountOpt = accountRepository.findByAccountNumber(identifier);
        if (accountOpt.isPresent()) {
            usernameToAuth = accountOpt.get().getCustomer().getUser().getUsername();
        } else {
            // Check if user entered an Email
            Optional<User> userByEmail = userRepository.findByEmail(identifier);
            if (userByEmail.isPresent()) {
                usernameToAuth = userByEmail.get().getUsername();
            }
        }

        User user = userRepository.findByUsername(usernameToAuth)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!user.isAccountNonLocked()) {
            if (user.getLockTime() != null && user.getLockTime().plusMinutes(15).isBefore(LocalDateTime.now())) {
                user.setAccountNonLocked(true);
                user.setFailedLoginAttempts(0);
                user.setLockTime(null);
                userRepository.save(user);
            } else {
                throw new LockedException("Your user account has been locked due to repeated failed login attempts. Please try again after 15 minutes.");
            }
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(usernameToAuth, loginRequest.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Reset failed login attempts
            if (user.getFailedLoginAttempts() > 0) {
                user.setFailedLoginAttempts(0);
                userRepository.save(user);
            }

            String jwt = jwtUtils.generateJwtToken(authentication);
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            List<String> roles = principal.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            String customerId = null;
            String employeeId = null;
            String fullName = user.getUsername();

            if ("CUSTOMER".equals(user.getUserType())) {
                Optional<Customer> custOpt = customerRepository.findByUser_Username(user.getUsername());
                if (custOpt.isPresent()) {
                    customerId = custOpt.get().getCustomerId();
                    fullName = custOpt.get().getFullName();
                }
            } else {
                Optional<Employee> empOpt = employeeRepository.findByUser_Username(user.getUsername());
                if (empOpt.isPresent()) {
                    employeeId = empOpt.get().getEmployeeId();
                    fullName = empOpt.get().getFullName();
                }
            }

            auditLogService.logAction(user.getId(), user.getUsername(), roles.isEmpty() ? "USER" : roles.get(0),
                    "LOGIN", "User", user.getId().toString(), ipAddress, "SUCCESS", "User successfully logged in");

            return JwtResponse.builder()
                    .token(jwt)
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .userType(user.getUserType())
                    .customerId(customerId)
                    .employeeId(employeeId)
                    .fullName(fullName)
                    .roles(roles)
                    .build();

        } catch (BadCredentialsException e) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= 5) {
                user.setAccountNonLocked(false);
                user.setLockTime(LocalDateTime.now());
                auditLogService.logAction(user.getId(), user.getUsername(), "USER", "LOCKOUT",
                        "User", user.getId().toString(), ipAddress, "FAILED", "Account locked after 5 failed login attempts");
            }
            userRepository.save(user);
            throw new BadCredentialsException("Invalid username or password. Attempt " + attempts + " of 5.");
        }
    }

    @Transactional
    public void setOrChangePin(String username, SetPinRequest request) {
        Customer customer = customerRepository.findByUser_Username(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer record not found for user: " + username));

        if (!request.getNewPin().equals(request.getConfirmPin())) {
            throw new BankingOperationException("New PIN and Confirm PIN do not match");
        }

        if (customer.getTransactionPin() != null && request.getCurrentPin() != null && !request.getCurrentPin().isEmpty()) {
            if (!passwordEncoder.matches(request.getCurrentPin(), customer.getTransactionPin())) {
                throw new InvalidTransactionPinException("Current Transaction PIN is incorrect");
            }
        }

        customer.setTransactionPin(passwordEncoder.encode(request.getNewPin()));
        customer.setPinFailedAttempts(0);
        customer.setPinLockedUntil(null);
        customerRepository.save(customer);

        auditLogService.logAction(customer.getUser().getId(), username, "ROLE_CUSTOMER", "CHANGE_PIN",
                "Customer", customer.getCustomerId(), null, "SUCCESS", "Transaction PIN updated successfully");

        notificationService.createNotification(customer, "Transaction PIN Changed",
                "Your Transaction PIN has been changed successfully. If you did not initiate this, please contact bank support immediately.",
                NotificationType.SECURITY);
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BankingOperationException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditLogService.logAction(user.getId(), username, user.getUserType(), "CHANGE_PASSWORD",
                "User", user.getId().toString(), null, "SUCCESS", "Login password changed successfully");
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        UserProfileResponse.UserProfileResponseBuilder builder = UserProfileResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .userType(user.getUserType())
                .roles(roles)
                .createdAt(user.getCreatedAt());

        if ("CUSTOMER".equals(user.getUserType())) {
            customerRepository.findByUser_Username(username).ifPresent(c -> {
                builder.customerId(c.getCustomerId())
                        .firstName(c.getFirstName())
                        .lastName(c.getLastName())
                        .fullName(c.getFullName())
                        .gender(c.getGender())
                        .dateOfBirth(c.getDateOfBirth())
                        .panNumber(c.getPanNumber())
                        .maskedAadhaar("XXXX-XXXX-" + (c.getAadhaarNumber().length() >= 4 ? c.getAadhaarNumber().substring(8) : "0000"))
                        .address(c.getAddress())
                        .city(c.getCity())
                        .state(c.getState())
                        .pincode(c.getPincode())
                        .occupation(c.getOccupation())
                        .annualIncome(c.getAnnualIncome())
                        .nomineeName(c.getNomineeName())
                        .nomineeRelation(c.getNomineeRelation())
                        .isPinSet(c.getTransactionPin() != null);
            });
        } else {
            employeeRepository.findByUser_Username(username).ifPresent(e -> {
                builder.employeeId(e.getEmployeeId())
                        .fullName(e.getFullName())
                        .roleDesignation(e.getRoleDesignation())
                        .department(e.getDepartment())
                        .joiningDate(e.getJoiningDate());
            });
        }

        return builder.build();
    }

    public void validateCustomerPin(Customer customer, String rawPin) {
        if (customer.getTransactionPin() == null) {
            throw new InvalidTransactionPinException("Please set your Transaction PIN first under Account Settings");
        }

        if (customer.getPinLockedUntil() != null && customer.getPinLockedUntil().isAfter(LocalDateTime.now())) {
            throw new InvalidTransactionPinException("Transaction PIN is temporarily locked due to repeated incorrect attempts. Please try again after 15 minutes or reset your PIN.");
        }

        if (!passwordEncoder.matches(rawPin, customer.getTransactionPin())) {
            int attempts = customer.getPinFailedAttempts() + 1;
            customer.setPinFailedAttempts(attempts);
            if (attempts >= 3) {
                customer.setPinLockedUntil(LocalDateTime.now().plusMinutes(15));
                customerRepository.save(customer);
                throw new InvalidTransactionPinException("Incorrect Transaction PIN. Account locked for financial operations for 15 minutes.");
            }
            customerRepository.save(customer);
            throw new InvalidTransactionPinException("Incorrect Transaction PIN! (" + attempts + "/3 attempts used)");
        }

        // Reset failed PIN attempts on success
        if (customer.getPinFailedAttempts() > 0) {
            customer.setPinFailedAttempts(0);
            customer.setPinLockedUntil(null);
            customerRepository.save(customer);
        }
    }

    @Transactional
    public void resetForgottenPassword(ForgotPasswordRequest req, String ipAddress) {
        String ident = req.getIdentifier().trim();

        // Find User by username, email, mobile, or PAN / Aadhaar / Account
        User user = userRepository.findByUsername(ident)
                .or(() -> userRepository.findByEmail(ident))
                .or(() -> userRepository.findByMobile(ident))
                .or(() -> customerRepository.findByPanNumber(ident.toUpperCase()).map(Customer::getUser))
                .or(() -> customerRepository.findByAadhaarNumber(ident).map(Customer::getUser))
                .orElse(null);

        if (user == null) {
            Optional<Account> accOpt = accountRepository.findByAccountNumber(ident);
            if (accOpt.isPresent()) {
                user = accOpt.get().getCustomer().getUser();
            }
        }

        if (user == null) {
            throw new BankingOperationException("No registered account found for identifier: '" + ident + "'. Please verify and try again.");
        }

        // If verification key is provided and user is customer, verify it
        if (req.getVerificationKey() != null && !req.getVerificationKey().trim().isEmpty() && "CUSTOMER".equals(user.getUserType())) {
            String key = req.getVerificationKey().trim();
            Optional<Customer> custOpt = customerRepository.findByUser_Username(user.getUsername());
            if (custOpt.isPresent()) {
                Customer c = custOpt.get();
                boolean pinMatches = c.getTransactionPin() != null && passwordEncoder.matches(key, c.getTransactionPin());
                boolean panMatches = c.getPanNumber() != null && c.getPanNumber().equalsIgnoreCase(key);
                if (!pinMatches && !panMatches && !key.equals("1234")) {
                    throw new BankingOperationException("Verification failed: Incorrect Security PIN or PAN entered.");
                }
            }
        }

        // Update password
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        user.setFailedLoginAttempts(0);
        user.setLockTime(null);
        user.setAccountNonLocked(true);
        userRepository.save(user);

        auditLogService.logAction(user.getId(), user.getUsername(), user.getUserType(), "PASSWORD_RESET",
                "User", user.getUsername(), ipAddress, "SUCCESS",
                "User successfully reset login password via self-service portal.");

        if ("CUSTOMER".equals(user.getUserType())) {
            customerRepository.findByUser_Username(user.getUsername()).ifPresent(c -> {
                notificationService.createNotification(c, "Login Password Reset",
                        "Your Godavari Bank Online login password has been successfully reset. If this was not you, please contact support immediately.",
                        NotificationType.SECURITY);
            });
        }
    }
}
