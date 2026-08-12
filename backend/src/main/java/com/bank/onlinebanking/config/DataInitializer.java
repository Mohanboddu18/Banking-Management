package com.bank.onlinebanking.config;

import com.bank.onlinebanking.entity.*;
import com.bank.onlinebanking.entity.enums.*;
import com.bank.onlinebanking.repository.*;
import com.bank.onlinebanking.util.ReferenceGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final AccountTypeRepository accountTypeRepository;
    private final AccountRepository accountRepository;
    private final TransactionTypeRepository transactionTypeRepository;
    private final TransactionRepository transactionRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final DebitCardRepository debitCardRepository;
    private final CreditCardRepository creditCardRepository;
    private final LoanTypeRepository loanTypeRepository;
    private final LoanRepository loanRepository;
    private final LoanRepaymentRepository loanRepaymentRepository;
    private final ComplaintRepository complaintRepository;
    private final NotificationRepository notificationRepository;
    private final MerchantRepository merchantRepository;
    private final MerchantQrCodeRepository merchantQrCodeRepository;
    private final MobileOperatorRepository mobileOperatorRepository;
    private final MobileRechargePlanRepository mobileRechargePlanRepository;
    private final LocationRepository locationRepository;
    private final TheatreRepository theatreRepository;
    private final ScreenRepository screenRepository;
    private final MovieRepository movieRepository;
    private final ShowRepository showRepository;
    private final SeatRepository seatRepository;
    private final BankChargeRepository bankChargeRepository;
    private final PasswordEncoder passwordEncoder;
    private final ReferenceGenerator referenceGenerator;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            if (userRepository.count() > 0) {
                log.info("Database already seeded with demo data. Skipping initialization.");
                return;
            }

            log.info("Initializing Online Banking Database with SBI-inspired Demo Data...");

            // 1. Roles
            Map<RoleName, Role> roles = new EnumMap<>(RoleName.class);
            for (RoleName rn : RoleName.values()) {
                Role r = roleRepository.findByName(rn).orElseGet(() -> roleRepository.save(Role.builder()
                        .name(rn)
                        .description(rn.name().replace("ROLE_", "") + " role")
                        .build()));
                roles.put(rn, r);
            }

            // 2. Account Types
            AccountType savings = accountTypeRepository.findByCode("SAVINGS").orElseGet(() -> accountTypeRepository.save(AccountType.builder()
                    .code("SAVINGS")
                    .name("Regular Savings Account")
                    .description("Standard interest bearing retail savings account")
                    .minBalance(BigDecimal.valueOf(3000.00))
                    .interestRate(BigDecimal.valueOf(3.50))
                    .dailyTransferLimit(BigDecimal.valueOf(100000.00))
                    .build()));

            AccountType current = accountTypeRepository.findByCode("CURRENT").orElseGet(() -> accountTypeRepository.save(AccountType.builder()
                    .code("CURRENT")
                    .name("Commercial Current Account")
                    .description("High volume business account with zero interest")
                    .minBalance(BigDecimal.valueOf(10000.00))
                    .interestRate(BigDecimal.ZERO)
                    .dailyTransferLimit(BigDecimal.valueOf(500000.00))
                    .build()));

            AccountType salary = accountTypeRepository.findByCode("SALARY").orElseGet(() -> accountTypeRepository.save(AccountType.builder()
                    .code("SALARY")
                    .name("Corporate Salary Account")
                    .description("Zero balance payroll account with preferential rates")
                    .minBalance(BigDecimal.ZERO)
                    .interestRate(BigDecimal.valueOf(4.00))
                    .dailyTransferLimit(BigDecimal.valueOf(200000.00))
                    .build()));

            // 3. Transaction Types
            List<String> txnCodes = List.of(
                    "DEPOSIT", "WITHDRAWAL", "P2P_TRANSFER", "QR_PAYMENT", "CARD_PAYMENT",
                    "MOBILE_RECHARGE", "MOVIE_BOOKING", "LOAN_DISBURSEMENT", "EMI_PAYMENT", "BANK_CHARGE", "REFUND"
            );
            Map<String, TransactionType> txnTypes = new HashMap<>();
            for (String code : txnCodes) {
                TransactionType tt = transactionTypeRepository.findByCode(code).orElseGet(() -> transactionTypeRepository.save(TransactionType.builder()
                        .code(code)
                        .name(code.replace("_", " "))
                        .build()));
                txnTypes.put(code, tt);
            }

            // 4. Loan Types
            LoanType personalLoan = loanTypeRepository.findByCode("PERSONAL").orElseGet(() -> loanTypeRepository.save(LoanType.builder()
                    .code("PERSONAL")
                    .name("SBI Quick Personal Loan")
                    .interestRate(BigDecimal.valueOf(11.50))
                    .minAmount(BigDecimal.valueOf(25000.00))
                    .maxAmount(BigDecimal.valueOf(1500000.00))
                    .minTenureMonths(6)
                    .maxTenureMonths(60)
                    .processingFeePercent(BigDecimal.valueOf(1.00))
                    .build()));

            LoanType homeLoan = loanTypeRepository.findByCode("HOME").orElseGet(() -> loanTypeRepository.save(LoanType.builder()
                    .code("HOME")
                    .name("SBI Regular Home Loan")
                    .interestRate(BigDecimal.valueOf(8.50))
                    .minAmount(BigDecimal.valueOf(500000.00))
                    .maxAmount(BigDecimal.valueOf(10000000.00))
                    .minTenureMonths(12)
                    .maxTenureMonths(360)
                    .processingFeePercent(BigDecimal.valueOf(0.50))
                    .build()));

            LoanType educationLoan = loanTypeRepository.findByCode("EDUCATION").orElseGet(() -> loanTypeRepository.save(LoanType.builder()
                    .code("EDUCATION")
                    .name("SBI Scholar Education Loan")
                    .interestRate(BigDecimal.valueOf(9.00))
                    .minAmount(BigDecimal.valueOf(100000.00))
                    .maxAmount(BigDecimal.valueOf(5000000.00))
                    .minTenureMonths(12)
                    .maxTenureMonths(180)
                    .processingFeePercent(BigDecimal.ZERO)
                    .build()));

            LoanType vehicleLoan = loanTypeRepository.findByCode("VEHICLE").orElseGet(() -> loanTypeRepository.save(LoanType.builder()
                    .code("VEHICLE")
                    .name("SBI New Car Loan")
                    .interestRate(BigDecimal.valueOf(8.80))
                    .minAmount(BigDecimal.valueOf(100000.00))
                    .maxAmount(BigDecimal.valueOf(3000000.00))
                    .minTenureMonths(12)
                    .maxTenureMonths(84)
                    .processingFeePercent(BigDecimal.valueOf(0.75))
                    .build()));

        // 5. Configurable Bank Charges
        bankChargeRepository.save(BankCharge.builder()
                .chargeName("Minimum Balance Non-Maintenance Penalty")
                .chargeType(ChargeType.MIN_BALANCE_MAINTENANCE)
                .amount(BigDecimal.valueOf(150.00))
                .accountType(savings)
                .minBalanceThreshold(BigDecimal.valueOf(3000.00))
                .frequency(ChargeFrequency.MONTHLY)
                .active(true)
                .build());

        bankChargeRepository.save(BankCharge.builder()
                .chargeName("Monthly SMS Alert Subscription Fee")
                .chargeType(ChargeType.SMS_ALERT_FEE)
                .amount(BigDecimal.valueOf(15.00))
                .frequency(ChargeFrequency.MONTHLY)
                .active(true)
                .build());

        bankChargeRepository.save(BankCharge.builder()
                .chargeName("Annual Debit Card Maintenance Charge")
                .chargeType(ChargeType.ANNUAL_CARD_MAINTENANCE)
                .amount(BigDecimal.valueOf(200.00))
                .frequency(ChargeFrequency.ANNUAL)
                .active(true)
                .build());

        // 6. Telecom Operators & Recharge Plans
        MobileOperator airtel = mobileOperatorRepository.save(MobileOperator.builder()
                .name("Airtel")
                .circle("All India")
                .logoUrl("https://upload.wikimedia.org/wikipedia/commons/b/b3/Airtel_logo.svg")
                .build());

        MobileOperator jio = mobileOperatorRepository.save(MobileOperator.builder()
                .name("Jio")
                .circle("All India")
                .logoUrl("https://upload.wikimedia.org/wikipedia/commons/5/50/Reliance_Jio_Logo_%28October_2015%29.svg")
                .build());

        MobileOperator vi = mobileOperatorRepository.save(MobileOperator.builder()
                .name("Vi")
                .circle("All India")
                .logoUrl("https://upload.wikimedia.org/wikipedia/commons/7/7b/Vodafone_Idea_Logo.svg")
                .build());

        MobileOperator bsnl = mobileOperatorRepository.save(MobileOperator.builder()
                .name("BSNL")
                .circle("All India")
                .logoUrl("https://upload.wikimedia.org/wikipedia/commons/4/4b/BSNL_2000.svg")
                .build());

        // Plans
        List<MobileRechargePlan> samplePlans = List.of(
                MobileRechargePlan.builder().operator(jio).planName("Hero 28 Days").amount(BigDecimal.valueOf(299.00)).validityDays(28).dataQuota("1.5 GB/Day").talktime("Truly Unlimited").description("Unlimited 5G Data + 100 SMS/Day").build(),
                MobileRechargePlan.builder().operator(jio).planName("Super 84 Days").amount(BigDecimal.valueOf(719.00)).validityDays(84).dataQuota("2.0 GB/Day").talktime("Truly Unlimited").description("Unlimited 5G Data + JioCinema Premium").build(),
                MobileRechargePlan.builder().operator(jio).planName("Annual Value").amount(BigDecimal.valueOf(2999.00)).validityDays(365).dataQuota("2.5 GB/Day").talktime("Truly Unlimited").description("Full Year High Speed Data + OTT Pack").build(),
                MobileRechargePlan.builder().operator(airtel).planName("Truly Unlimited 28D").amount(BigDecimal.valueOf(319.00)).validityDays(28).dataQuota("1.5 GB/Day").talktime("Unlimited").description("Wynk Music + Apollo 24|7").build(),
                MobileRechargePlan.builder().operator(airtel).planName("Mega Pack 84D").amount(BigDecimal.valueOf(839.00)).validityDays(84).dataQuota("2.0 GB/Day").talktime("Unlimited").description("Disney+ Hotstar 3 Months Mobile").build(),
                MobileRechargePlan.builder().operator(vi).planName("Vi Hero Unlimited").amount(BigDecimal.valueOf(299.00)).validityDays(28).dataQuota("1.5 GB/Day").talktime("Truly Unlimited").description("Binge All Night (12am to 6am Free)").build(),
                MobileRechargePlan.builder().operator(bsnl).planName("BSNL Voice & Data").amount(BigDecimal.valueOf(199.00)).validityDays(30).dataQuota("2.0 GB/Day").talktime("Truly Unlimited").description("National Roaming Free").build()
        );
        mobileRechargePlanRepository.saveAll(samplePlans);

        // 7. Movie Cinema Data
        Location mumbai = locationRepository.save(Location.builder().cityName("Mumbai").stateName("Maharashtra").build());
        Location delhi = locationRepository.save(Location.builder().cityName("Delhi NCR").stateName("Delhi").build());
        Location vijayawada = locationRepository.save(Location.builder().cityName("Vijayawada").stateName("Andhra Pradesh").build());

        Theatre pvr = theatreRepository.save(Theatre.builder().location(mumbai).name("PVR ICON Grand Central").address("Lower Parel, Mumbai").build());
        Theatre inox = theatreRepository.save(Theatre.builder().location(vijayawada).name("INOX ABC Cinemas").address("MG Road, Vijayawada").build());

        Screen pvrScreen1 = screenRepository.save(Screen.builder().theatre(pvr).screenName("Audi 1 - Dolby Atmos 4K").totalRows(6).totalCols(10).build());
        Screen inoxScreen1 = screenRepository.save(Screen.builder().theatre(inox).screenName("Screen 1 - 3D Laser").totalRows(6).totalCols(10).build());

        // Create 60 seats for each screen (Rows A to F, Cols 1 to 10)
        List<Seat> allSeats = new ArrayList<>();
        for (Screen scr : List.of(pvrScreen1, inoxScreen1)) {
            for (char row = 'A'; row <= 'F'; row++) {
                for (int col = 1; col <= 10; col++) {
                    SeatType st = SeatType.STANDARD;
                    if (row >= 'C' && row <= 'D') st = SeatType.PREMIUM;
                    if (row >= 'E') st = SeatType.RECLINER;

                    allSeats.add(Seat.builder()
                            .screen(scr)
                            .rowLabel(String.valueOf(row))
                            .colNumber(col)
                            .seatType(st)
                            .build());
                }
            }
        }
        seatRepository.saveAll(allSeats);

        // Movies
        Movie movie1 = movieRepository.save(Movie.builder()
                .title("Kalki 2898 AD")
                .genre("Action / Sci-Fi")
                .durationMinutes(180)
                .language("Telugu / Hindi")
                .posterUrl("https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500")
                .description("A futuristic epic set in the dystopian post-apocalyptic world of Kasi.")
                .rating(8.9)
                .releaseDate(LocalDate.of(2024, 6, 27))
                .build());

        Movie movie2 = movieRepository.save(Movie.builder()
                .title("Devara: Part 1")
                .genre("Action / Drama")
                .durationMinutes(175)
                .language("Telugu / Hindi")
                .posterUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500")
                .description("An epic saga of courage and betrayal set in the coastal terrains.")
                .rating(8.7)
                .releaseDate(LocalDate.of(2024, 9, 27))
                .build());

        // Shows
        showRepository.save(Show.builder()
                .screen(pvrScreen1)
                .movie(movie1)
                .showDate(LocalDate.now())
                .showTime(LocalTime.of(18, 30))
                .ticketPrice(BigDecimal.valueOf(350.00))
                .build());

        showRepository.save(Show.builder()
                .screen(inoxScreen1)
                .movie(movie2)
                .showDate(LocalDate.now())
                .showTime(LocalTime.of(21, 0))
                .ticketPrice(BigDecimal.valueOf(250.00))
                .build());

        // 8. Bank Staff & Employees (6 Employees including Manager)
        String defaultPasswordHash = passwordEncoder.encode("Password@123");

        // 1) Bank Manager
        createEmployeeUser("manager", "Arun Sharma", "manager@sbi.bank", "9811122201",
                RoleName.ROLE_MANAGER, "Executive Management", "EMP001", defaultPasswordHash, roles);

        // 2) Assistant Manager
        createEmployeeUser("asst_manager", "Pooja Nair", "pooja.nair@sbi.bank", "9811122202",
                RoleName.ROLE_EMPLOYEE_ASST_MANAGER, "Branch Operations", "EMP002", defaultPasswordHash, roles);

        // 3) Cashier
        createEmployeeUser("cashier", "Ramesh Kumar", "ramesh.kumar@sbi.bank", "9811122203",
                RoleName.ROLE_EMPLOYEE_CASHIER, "Cash & Counter", "EMP003", defaultPasswordHash, roles);

        // 4) Loan Officer
        createEmployeeUser("loan_officer", "Vikram Sethi", "vikram.sethi@sbi.bank", "9811122204",
                RoleName.ROLE_EMPLOYEE_LOAN_OFFICER, "Credit & Loans", "EMP004", defaultPasswordHash, roles);

        // 5) Customer Service Officer
        createEmployeeUser("support_officer", "Sneha Patel", "sneha.patel@sbi.bank", "9811122205",
                RoleName.ROLE_EMPLOYEE_CUSTOMER_SERVICE, "Customer Support", "EMP005", defaultPasswordHash, roles);

        // 6) Operations Officer
        createEmployeeUser("ops_officer", "Manoj Verma", "manoj.verma@sbi.bank", "9811122206",
                RoleName.ROLE_EMPLOYEE_OPERATIONS, "Card & Cheque Operations", "EMP006", defaultPasswordHash, roles);

        // 9. Customers (10 Pre-populated Customers with Accounts)
        String pinHash = passwordEncoder.encode("1234");

        List<CustomerData> custDataList = List.of(
                new CustomerData("customer1", "Mohan", "Krishna", "mohan@bank.com", "9876543210", "ABCDE1001F", "123456789001", "SBIN00010001", BigDecimal.valueOf(75000.00), "Hyderabad"),
                new CustomerData("customer2", "Priya", "Sharma", "priya@bank.com", "9876543211", "ABCDE1002F", "123456789002", "SBIN00010002", BigDecimal.valueOf(45000.00), "Mumbai"),
                new CustomerData("customer3", "Rahul", "Verma", "rahul@bank.com", "9876543212", "ABCDE1003F", "123456789003", "SBIN00010003", BigDecimal.valueOf(120000.00), "Delhi"),
                new CustomerData("customer4", "Ananya", "Iyer", "ananya@bank.com", "9876543213", "ABCDE1004F", "123456789004", "SBIN00010004", BigDecimal.valueOf(32000.00), "Chennai"),
                new CustomerData("customer5", "Karthik", "Reddy", "karthik@bank.com", "9876543214", "ABCDE1005F", "123456789005", "SBIN00010005", BigDecimal.valueOf(95000.00), "Vijayawada"),
                new CustomerData("customer6", "Deepika", "Padukone", "deepika@bank.com", "9876543215", "ABCDE1006F", "123456789006", "SBIN00010006", BigDecimal.valueOf(250000.00), "Bengaluru"),
                new CustomerData("customer7", "Suresh", "Raina", "suresh@bank.com", "9876543216", "ABCDE1007F", "123456789007", "SBIN00010007", BigDecimal.valueOf(60000.00), "Lucknow"),
                new CustomerData("customer8", "Neha", "Gupta", "neha@bank.com", "9876543217", "ABCDE1008F", "123456789008", "SBIN00010008", BigDecimal.valueOf(18000.00), "Pune"),
                new CustomerData("customer9", "Aditya", "Roy", "aditya@bank.com", "9876543218", "ABCDE1009F", "123456789009", "SBIN00010009", BigDecimal.valueOf(88000.00), "Kolkata"),
                new CustomerData("customer10", "Divya", "Joshi", "divya@bank.com", "9876543219", "ABCDE1010F", "123456789010", "SBIN00010010", BigDecimal.valueOf(52000.00), "Ahmedabad")
        );

        int cIdx = 1;
        Account customer1Account = null;
        Account customer2Account = null;
        Customer customer1Obj = null;

        for (CustomerData cd : custDataList) {
            User u = userRepository.save(User.builder()
                    .username(cd.username)
                    .password(defaultPasswordHash)
                    .email(cd.email)
                    .mobile(cd.mobile)
                    .userType("CUSTOMER")
                    .enabled(true)
                    .accountNonLocked(true)
                    .roles(Set.of(roles.get(RoleName.ROLE_CUSTOMER)))
                    .build());

            String custId = String.format("CUST100%03d", cIdx);
            Customer c = customerRepository.save(Customer.builder()
                    .user(u)
                    .customerId(custId)
                    .firstName(cd.firstName)
                    .lastName(cd.lastName)
                    .gender(cIdx % 2 == 0 ? "Female" : "Male")
                    .dateOfBirth(LocalDate.of(1995, (cIdx % 12) + 1, 15))
                    .panNumber(cd.pan)
                    .aadhaarNumber(cd.aadhaar)
                    .address("Flat " + (100 + cIdx) + ", Lakeview Residency")
                    .city(cd.city)
                    .state("State")
                    .pincode("5000" + (10 + cIdx))
                    .occupation("Software Professional")
                    .annualIncome(BigDecimal.valueOf(1200000.00))
                    .nomineeName(cd.firstName + " Nominee")
                    .nomineeRelation("Spouse")
                    .transactionPin(pinHash)
                    .build());

            Account acc = accountRepository.save(Account.builder()
                    .customer(c)
                    .accountNumber(cd.accNum)
                    .accountType(savings)
                    .balance(cd.initialBal)
                    .ledgerBalance(cd.initialBal)
                    .status(AccountStatus.ACTIVE)
                    .ifscCode("SBIN000123")
                    .branchName("Godavari Bank Financial Center, Mumbai")
                    .openingDate(LocalDate.now().minusMonths(6))
                    .build());

            // Add debit card
            debitCardRepository.save(DebitCard.builder()
                    .account(acc)
                    .cardNumber("45320000" + String.format("%08d", cIdx))
                    .maskedCardNumber("XXXX-XXXX-XXXX-" + String.format("%04d", cIdx))
                    .cardHolderName(c.getFullName().toUpperCase())
                    .cardType(CardType.VISA_PLATINUM_DEBIT)
                    .expiryMonth(12)
                    .expiryYear(2029)
                    .cvvHash(defaultPasswordHash)
                    .dailyLimit(BigDecimal.valueOf(50000.00))
                    .status(CardStatus.ACTIVE)
                    .build());

            if (cIdx == 1) {
                customer1Account = acc;
                customer1Obj = c;
            }
            if (cIdx == 2) {
                customer2Account = acc;
            }
            cIdx++;
        }

        // 10. Sample Merchants & QR Codes
        Account merchantAcc = accountRepository.save(Account.builder()
                .customer(customer1Obj)
                .accountNumber("SBIN00099901")
                .accountType(current)
                .balance(BigDecimal.valueOf(500000.00))
                .ledgerBalance(BigDecimal.valueOf(500000.00))
                .status(AccountStatus.ACTIVE)
                .ifscCode("SBIN000123")
                .branchName("State Bank Financial Center, Mumbai")
                .openingDate(LocalDate.now().minusYears(1))
                .build());

        Merchant m1 = merchantRepository.save(Merchant.builder()
                .merchantCode("MERCH001")
                .businessName("ABC Restaurant & Bar")
                .ownerName("Sanjay Oberoi")
                .mobile("9822001100")
                .email("contact@abcrestaurant.com")
                .settlementAccount(merchantAcc)
                .category("Restaurant & Dining")
                .status("ACTIVE")
                .build());

        merchantQrCodeRepository.save(MerchantQrCode.builder()
                .merchant(m1)
                .qrPayload("upi://pay?pa=sbi.merch001@sbi&pn=ABCRestaurant&mc=5812")
                .isStatic(true)
                .build());

        Merchant m2 = merchantRepository.save(Merchant.builder()
                .merchantCode("MERCH002")
                .businessName("D-Mart Retail Supermarket")
                .ownerName("Radhakishan Damani")
                .mobile("9822001101")
                .email("billing@dmart.com")
                .settlementAccount(merchantAcc)
                .category("Groceries & Supermarket")
                .status("ACTIVE")
                .build());

        merchantQrCodeRepository.save(MerchantQrCode.builder()
                .merchant(m2)
                .qrPayload("upi://pay?pa=sbi.merch002@sbi&pn=DMartSupermarket&mc=5411")
                .isStatic(true)
                .build());

        // 11. Sample Transactions for Customer 1
        if (customer1Account != null && customer2Account != null) {
            Transaction txn1 = Transaction.builder()
                    .transactionRef("TXN2026080100001")
                    .fromAccount(null)
                    .toAccount(customer1Account)
                    .transactionType(txnTypes.get("DEPOSIT"))
                    .amount(BigDecimal.valueOf(50000.00))
                    .balanceAfter(BigDecimal.valueOf(50000.00))
                    .receiverBalanceAfter(BigDecimal.valueOf(50000.00))
                    .description("Monthly Salary Credit")
                    .status(TransactionStatus.SUCCESS)
                    .build();
            transactionRepository.save(txn1);

            Transaction txn2 = Transaction.builder()
                    .transactionRef("TXN2026080500002")
                    .fromAccount(customer1Account)
                    .toAccount(customer2Account)
                    .transactionType(txnTypes.get("P2P_TRANSFER"))
                    .amount(BigDecimal.valueOf(5000.00))
                    .balanceAfter(BigDecimal.valueOf(45000.00))
                    .senderBalanceAfter(BigDecimal.valueOf(45000.00))
                    .receiverBalanceAfter(BigDecimal.valueOf(45000.00))
                    .description("Transfer to Priya Sharma")
                    .status(TransactionStatus.SUCCESS)
                    .build();
            transactionRepository.save(txn2);

            Transaction txn3 = Transaction.builder()
                    .transactionRef("TXN2026080800003")
                    .fromAccount(customer1Account)
                    .toAccount(merchantAcc)
                    .transactionType(txnTypes.get("QR_PAYMENT"))
                    .amount(BigDecimal.valueOf(850.00))
                    .balanceAfter(BigDecimal.valueOf(44150.00))
                    .senderBalanceAfter(BigDecimal.valueOf(44150.00))
                    .receiverBalanceAfter(BigDecimal.valueOf(850.00))
                    .description("Paid to ABC Restaurant & Bar")
                    .status(TransactionStatus.SUCCESS)
                    .build();
            transactionRepository.save(txn3);

            // Add Saved Beneficiary for Customer 1
            beneficiaryRepository.save(Beneficiary.builder()
                    .customer(customer1Obj)
                    .beneficiaryName("Priya Sharma")
                    .accountNumber(customer2Account.getAccountNumber())
                    .ifscCode(customer2Account.getIfscCode())
                    .bankName("Godavari Bank")
                    .maxLimit(BigDecimal.valueOf(100000.00))
                    .build());

            // Add Sample Complaint for Customer 1
            complaintRepository.save(Complaint.builder()
                    .complaintTicket("TKT20260801001")
                    .customer(customer1Obj)
                    .category(ComplaintCategory.CARD_ISSUE)
                    .subject("International usage enablement request")
                    .description("I want to enable international POS transactions on my Visa Platinum debit card for upcoming travel.")
                    .priority(ComplaintPriority.MEDIUM)
                    .status(ComplaintStatus.IN_PROGRESS)
                    .resolutionNotes("Assigned to Customer Service desk. Verified KYC.")
                    .build());

            // Add Sample Notification
            notificationRepository.save(Notification.builder()
                    .customer(customer1Obj)
                    .title("Welcome to Online Banking")
                    .message("Welcome Mohan Krishna! Your Savings account SBIN00010001 is active. Enjoy seamless 24x7 digital banking.")
                    .type(NotificationType.SYSTEM)
                    .isRead(false)
                    .build());
        }

        log.info("Database initialization completed successfully!");
        log.info("Demo Credentials: Manager: manager/Password@123 | Customer: customer1/Password@123 (PIN: 1234)");
        } catch (Exception e) {
            log.error("Data initialization encountered an error (continuing startup): {}", e.getMessage(), e);
        }
    }

    private void createEmployeeUser(String username, String fullName, String email, String mobile,
                                    RoleName roleName, String department, String empId, String passwordHash,
                                    Map<RoleName, Role> roles) {
        User u = userRepository.save(User.builder()
                .username(username)
                .password(passwordHash)
                .email(email)
                .mobile(mobile)
                .userType("EMPLOYEE")
                .enabled(true)
                .accountNonLocked(true)
                .roles(Set.of(roles.get(roleName)))
                .build());

        employeeRepository.save(Employee.builder()
                .user(u)
                .employeeId(empId)
                .fullName(fullName)
                .roleDesignation(department)
                .department(department)
                .joiningDate(LocalDate.of(2022, 1, 10))
                .status("ACTIVE")
                .build());
    }

    private record CustomerData(String username, String firstName, String lastName, String email,
                                String mobile, String pan, String aadhaar, String accNum,
                                BigDecimal initialBal, String city) {}
}
