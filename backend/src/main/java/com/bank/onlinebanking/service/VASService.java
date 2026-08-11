package com.bank.onlinebanking.service;

import com.bank.onlinebanking.dto.vas.*;
import com.bank.onlinebanking.entity.*;
import com.bank.onlinebanking.entity.enums.*;
import com.bank.onlinebanking.exception.*;
import com.bank.onlinebanking.repository.*;
import com.bank.onlinebanking.util.ReferenceGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VASService {

    private final MerchantRepository merchantRepository;
    private final MerchantQrCodeRepository merchantQrCodeRepository;
    private final MobileOperatorRepository mobileOperatorRepository;
    private final MobileRechargePlanRepository mobileRechargePlanRepository;
    private final MobileRechargeRepository mobileRechargeRepository;
    private final LocationRepository locationRepository;
    private final TheatreRepository theatreRepository;
    private final MovieRepository movieRepository;
    private final ShowRepository showRepository;
    private final SeatRepository seatRepository;
    private final MovieBookingRepository movieBookingRepository;
    private final MovieBookingSeatRepository movieBookingSeatRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionTypeRepository transactionTypeRepository;
    private final AuthService authService;
    private final ReferenceGenerator referenceGenerator;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    // ==========================================
    // 1. QR CODE PAYMENTS
    // ==========================================
    @Transactional(readOnly = true)
    public List<Merchant> getAllMerchants() {
        return merchantRepository.findAll();
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public QRPaymentResponse payMerchantViaQR(String username, QRPaymentRequest req, String ipAddress) {
        Account customerAccount = accountRepository.findByAccountNumberForUpdate(req.getAccountNumber())
                .orElseThrow(() -> new AccountNotFoundException("Customer account not found: " + req.getAccountNumber()));

        Customer customer = customerAccount.getCustomer();
        if (!customer.getUser().getUsername().equals(username)) {
            throw new BankingOperationException("Access Denied: You do not own this account");
        }

        if (customerAccount.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountSuspendedException("Account is " + customerAccount.getStatus() + ". QR payments are disabled.");
        }

        // Validate PIN
        authService.validateCustomerPin(customer, req.getTransactionPin());

        // Find Merchant by QR code or merchant code
        Merchant merchant = null;
        Optional<MerchantQrCode> qrOpt = merchantQrCodeRepository.findByQrPayload(req.getQrPayload());
        if (qrOpt.isPresent()) {
            merchant = qrOpt.get().getMerchant();
        } else {
            merchant = merchantRepository.findByMerchantCode(req.getQrPayload())
                    .orElseThrow(() -> new ResourceNotFoundException("Invalid Merchant QR or Merchant Code: " + req.getQrPayload()));
        }

        Account merchantAccount = accountRepository.findByIdForUpdate(merchant.getSettlementAccount().getId())
                .orElseThrow(() -> new AccountNotFoundException("Merchant settlement account not found"));

        // Check Balance
        if (customerAccount.getBalance().compareTo(req.getAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient balance! Available balance is ₹" + customerAccount.getBalance());
        }

        // Update balances
        BigDecimal customerNewBalance = customerAccount.getBalance().subtract(req.getAmount());
        customerAccount.setBalance(customerNewBalance);
        customerAccount.setLedgerBalance(customerAccount.getLedgerBalance().subtract(req.getAmount()));
        accountRepository.save(customerAccount);

        BigDecimal merchantNewBalance = merchantAccount.getBalance().add(req.getAmount());
        merchantAccount.setBalance(merchantNewBalance);
        merchantAccount.setLedgerBalance(merchantAccount.getLedgerBalance().add(req.getAmount()));
        accountRepository.save(merchantAccount);

        // Transaction Record
        TransactionType qrType = transactionTypeRepository.findByCode("QR_PAYMENT")
                .orElseGet(() -> transactionTypeRepository.save(TransactionType.builder().code("QR_PAYMENT").name("QR Code Merchant Payment").build()));

        String txnRef = referenceGenerator.generateTransactionRef();
        String desc = "Paid to " + merchant.getBusinessName() + " (" + merchant.getCategory() + ")";
        if (req.getNote() != null && !req.getNote().isEmpty()) desc += " - " + req.getNote();

        Transaction txn = Transaction.builder()
                .transactionRef(txnRef)
                .fromAccount(customerAccount)
                .toAccount(merchantAccount)
                .transactionType(qrType)
                .amount(req.getAmount())
                .balanceAfter(customerNewBalance)
                .senderBalanceAfter(customerNewBalance)
                .receiverBalanceAfter(merchantNewBalance)
                .description(desc)
                .status(TransactionStatus.SUCCESS)
                .build();
        transactionRepository.save(txn);

        auditLogService.logAction(customer.getUser().getId(), username, "ROLE_CUSTOMER", "QR_PAYMENT",
                "Transaction", txnRef, ipAddress, "SUCCESS",
                "Paid ₹" + req.getAmount() + " to " + merchant.getBusinessName());

        notificationService.createNotification(customer, "QR Payment Successful",
                "₹" + req.getAmount() + " paid to " + merchant.getBusinessName() + ". Available Balance: ₹" + customerNewBalance + " (Ref: " + txnRef + ")",
                NotificationType.VAS_RECHARGE);

        return QRPaymentResponse.builder()
                .transactionRef(txnRef)
                .merchantName(merchant.getBusinessName())
                .merchantCode(merchant.getMerchantCode())
                .merchantCategory(merchant.getCategory())
                .amount(req.getAmount())
                .remainingBalance(customerNewBalance)
                .status("SUCCESS")
                .timestamp(txn.getCreatedAt())
                .build();
    }

    // ==========================================
    // 2. MOBILE TELECOM RECHARGE
    // ==========================================
    @Transactional(readOnly = true)
    public List<MobileOperator> getAllOperators() {
        return mobileOperatorRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<MobileRechargePlan> getPlansForOperator(Long operatorId) {
        return mobileRechargePlanRepository.findAllByOperator_Id(operatorId);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public RechargeResponse rechargeMobile(String username, RechargeRequest req, String ipAddress) {
        Account account = accountRepository.findByAccountNumberForUpdate(req.getAccountNumber())
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + req.getAccountNumber()));

        Customer customer = account.getCustomer();
        if (!customer.getUser().getUsername().equals(username)) {
            throw new BankingOperationException("Access Denied: You do not own this account");
        }

        MobileOperator operator = mobileOperatorRepository.findById(req.getOperatorId())
                .orElseThrow(() -> new ResourceNotFoundException("Mobile Operator not found with ID: " + req.getOperatorId()));

        // Validate PIN
        authService.validateCustomerPin(customer, req.getTransactionPin());

        // Validate Balance
        if (account.getBalance().compareTo(req.getAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient balance to recharge! Available balance is ₹" + account.getBalance());
        }

        BigDecimal newBalance = account.getBalance().subtract(req.getAmount());
        account.setBalance(newBalance);
        account.setLedgerBalance(account.getLedgerBalance().subtract(req.getAmount()));
        accountRepository.save(account);

        String txnRef = referenceGenerator.generateTransactionRef();

        // Transaction Record
        TransactionType rechargeType = transactionTypeRepository.findByCode("MOBILE_RECHARGE")
                .orElseGet(() -> transactionTypeRepository.save(TransactionType.builder().code("MOBILE_RECHARGE").name("Mobile Balance Recharge").build()));

        Transaction txn = Transaction.builder()
                .transactionRef(txnRef)
                .fromAccount(account)
                .transactionType(rechargeType)
                .amount(req.getAmount())
                .balanceAfter(newBalance)
                .senderBalanceAfter(newBalance)
                .description("Mobile Recharge for " + req.getMobileNumber() + " (" + operator.getName() + " - " + req.getPlanName() + ")")
                .status(TransactionStatus.SUCCESS)
                .build();
        transactionRepository.save(txn);

        // Mobile Recharge Record
        MobileRecharge recharge = MobileRecharge.builder()
                .customer(customer)
                .account(account)
                .mobileNumber(req.getMobileNumber())
                .operator(operator)
                .planName(req.getPlanName())
                .amount(req.getAmount())
                .transactionRef(txnRef)
                .status("SUCCESS")
                .build();
        mobileRechargeRepository.save(recharge);

        auditLogService.logAction(customer.getUser().getId(), username, "ROLE_CUSTOMER", "MOBILE_RECHARGE",
                "MobileRecharge", txnRef, ipAddress, "SUCCESS",
                "Recharged " + req.getMobileNumber() + " (" + operator.getName() + ") for ₹" + req.getAmount());

        notificationService.createNotification(customer, "Mobile Recharge Successful",
                "Recharge of ₹" + req.getAmount() + " for mobile " + req.getMobileNumber() + " (" + operator.getName() + ") completed successfully! (Ref: " + txnRef + ")",
                NotificationType.VAS_RECHARGE);

        return RechargeResponse.builder()
                .transactionRef(txnRef)
                .mobileNumber(req.getMobileNumber())
                .operatorName(operator.getName())
                .planName(req.getPlanName())
                .amount(req.getAmount())
                .status("SUCCESS")
                .timestamp(recharge.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<MobileRecharge> getCustomerRecharges(String username) {
        return mobileRechargeRepository.findAllByCustomer_User_UsernameOrderByCreatedAtDesc(username);
    }

    // ==========================================
    // 3. MOVIE TICKET BOOKING
    // ==========================================
    @Transactional(readOnly = true)
    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Show> getShowsForMovie(Long movieId) {
        return showRepository.findAllByMovie_IdAndShowDateGreaterThanEqual(movieId, LocalDate.now());
    }

    @Transactional(readOnly = true)
    public SeatLayoutResponse getSeatLayout(Long showId) {
        Show show = showRepository.findById(showId)
                .orElseThrow(() -> new ResourceNotFoundException("Show not found with ID: " + showId));

        Screen screen = show.getScreen();
        List<Seat> allSeats = seatRepository.findAllByScreen_IdOrderByRowLabelAscColNumberAsc(screen.getId());
        List<MovieBookingSeat> bookedSeats = movieBookingSeatRepository.findBookedSeatsForShow(showId);
        Set<Long> bookedSeatIds = bookedSeats.stream().map(bs -> bs.getSeat().getId()).collect(Collectors.toSet());

        List<SeatLayoutResponse.SeatDetail> seatDetails = allSeats.stream().map(seat -> {
            BigDecimal price = show.getTicketPrice();
            if (seat.getSeatType() == SeatType.PREMIUM) {
                price = price.add(BigDecimal.valueOf(100.00));
            } else if (seat.getSeatType() == SeatType.RECLINER) {
                price = price.add(BigDecimal.valueOf(250.00));
            }

            return SeatLayoutResponse.SeatDetail.builder()
                    .seatId(seat.getId())
                    .rowLabel(seat.getRowLabel())
                    .colNumber(seat.getColNumber())
                    .seatCode(seat.getSeatCode())
                    .seatType(seat.getSeatType().name())
                    .price(price)
                    .isBooked(bookedSeatIds.contains(seat.getId()))
                    .build();
        }).collect(Collectors.toList());

        return SeatLayoutResponse.builder()
                .showId(show.getId())
                .movieTitle(show.getMovie().getTitle())
                .theatreName(screen.getTheatre().getName())
                .screenName(screen.getScreenName())
                .ticketPrice(show.getTicketPrice())
                .totalRows(screen.getTotalRows())
                .totalCols(screen.getTotalCols())
                .seats(seatDetails)
                .build();
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public MovieBookingResponse bookMovieTickets(String username, MovieBookingRequest req, String ipAddress) {
        Account account = accountRepository.findByAccountNumberForUpdate(req.getAccountNumber())
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + req.getAccountNumber()));

        Customer customer = account.getCustomer();
        if (!customer.getUser().getUsername().equals(username)) {
            throw new BankingOperationException("Access Denied: You do not own this account");
        }

        Show show = showRepository.findById(req.getShowId())
                .orElseThrow(() -> new ResourceNotFoundException("Show not found with ID: " + req.getShowId()));

        // Validate PIN
        authService.validateCustomerPin(customer, req.getTransactionPin());

        // Check if selected seats are already booked
        List<MovieBookingSeat> alreadyBooked = movieBookingSeatRepository.findBookedSeatsForShow(show.getId());
        Set<Long> bookedSeatIds = alreadyBooked.stream().map(b -> b.getSeat().getId()).collect(Collectors.toSet());

        List<Seat> seatsToBook = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<String> seatCodes = new ArrayList<>();

        for (Long seatId : req.getSeatIds()) {
            if (bookedSeatIds.contains(seatId)) {
                throw new BankingOperationException("One or more selected seats have already been booked by another customer! Please choose other seats.");
            }
            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new ResourceNotFoundException("Seat not found: " + seatId));

            BigDecimal price = show.getTicketPrice();
            if (seat.getSeatType() == SeatType.PREMIUM) price = price.add(BigDecimal.valueOf(100.00));
            else if (seat.getSeatType() == SeatType.RECLINER) price = price.add(BigDecimal.valueOf(250.00));

            totalAmount = totalAmount.add(price);
            seatCodes.add(seat.getSeatCode());
            seatsToBook.add(seat);
        }

        // Validate Balance
        if (account.getBalance().compareTo(totalAmount) < 0) {
            throw new InsufficientBalanceException("Insufficient balance for movie booking! Total Amount: ₹" + totalAmount + ", Available: ₹" + account.getBalance());
        }

        BigDecimal newBalance = account.getBalance().subtract(totalAmount);
        account.setBalance(newBalance);
        account.setLedgerBalance(account.getLedgerBalance().subtract(totalAmount));
        accountRepository.save(account);

        String txnRef = referenceGenerator.generateTransactionRef();
        String bookingRef = referenceGenerator.generateBookingRef();
        String seatNumbersStr = String.join(", ", seatCodes);

        // Transaction Record
        TransactionType movieType = transactionTypeRepository.findByCode("MOVIE_BOOKING")
                .orElseGet(() -> transactionTypeRepository.save(TransactionType.builder().code("MOVIE_BOOKING").name("Movie Ticket Booking").build()));

        Transaction txn = Transaction.builder()
                .transactionRef(txnRef)
                .fromAccount(account)
                .transactionType(movieType)
                .amount(totalAmount)
                .balanceAfter(newBalance)
                .senderBalanceAfter(newBalance)
                .description("Movie Booking for " + show.getMovie().getTitle() + " at " + show.getScreen().getTheatre().getName() + " (Seats: " + seatNumbersStr + ")")
                .status(TransactionStatus.SUCCESS)
                .build();
        transactionRepository.save(txn);

        // Create Booking
        MovieBooking booking = MovieBooking.builder()
                .bookingRef(bookingRef)
                .show(show)
                .customer(customer)
                .account(account)
                .totalSeats(seatsToBook.size())
                .seatNumbers(seatNumbersStr)
                .totalAmount(totalAmount)
                .transactionRef(txnRef)
                .status(BookingStatus.CONFIRMED)
                .build();
        booking = movieBookingRepository.save(booking);

        for (Seat seat : seatsToBook) {
            BigDecimal price = show.getTicketPrice();
            if (seat.getSeatType() == SeatType.PREMIUM) price = price.add(BigDecimal.valueOf(100.00));
            else if (seat.getSeatType() == SeatType.RECLINER) price = price.add(BigDecimal.valueOf(250.00));

            MovieBookingSeat bookingSeat = MovieBookingSeat.builder()
                    .booking(booking)
                    .seat(seat)
                    .price(price)
                    .build();
            movieBookingSeatRepository.save(bookingSeat);
        }

        auditLogService.logAction(customer.getUser().getId(), username, "ROLE_CUSTOMER", "MOVIE_BOOKING",
                "MovieBooking", bookingRef, ipAddress, "SUCCESS",
                "Booked " + seatsToBook.size() + " tickets for " + show.getMovie().getTitle() + " (Amount: ₹" + totalAmount + ")");

        notificationService.createNotification(customer, "Movie Tickets Confirmed!",
                "Your booking (" + bookingRef + ") for " + show.getMovie().getTitle() + " (Seats: " + seatNumbersStr + ") is confirmed at " + show.getScreen().getTheatre().getName() + ". Total: ₹" + totalAmount + ".",
                NotificationType.VAS_MOVIE);

        return MovieBookingResponse.builder()
                .id(booking.getId())
                .bookingRef(bookingRef)
                .movieTitle(show.getMovie().getTitle())
                .language(show.getMovie().getLanguage())
                .theatreName(show.getScreen().getTheatre().getName())
                .cityName(show.getScreen().getTheatre().getLocation().getCityName())
                .screenName(show.getScreen().getScreenName())
                .showDate(show.getShowDate())
                .showTime(show.getShowTime())
                .totalSeats(booking.getTotalSeats())
                .seatNumbers(seatNumbersStr)
                .totalAmount(totalAmount)
                .transactionRef(txnRef)
                .status("CONFIRMED")
                .bookingTime(booking.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<MovieBookingResponse> getCustomerMovieBookings(String username) {
        return movieBookingRepository.findAllByCustomer_User_UsernameOrderByCreatedAtDesc(username).stream()
                .map(b -> MovieBookingResponse.builder()
                        .id(b.getId())
                        .bookingRef(b.getBookingRef())
                        .movieTitle(b.getShow().getMovie().getTitle())
                        .language(b.getShow().getMovie().getLanguage())
                        .theatreName(b.getShow().getScreen().getTheatre().getName())
                        .cityName(b.getShow().getScreen().getTheatre().getLocation().getCityName())
                        .screenName(b.getShow().getScreen().getScreenName())
                        .showDate(b.getShow().getShowDate())
                        .showTime(b.getShow().getShowTime())
                        .totalSeats(b.getTotalSeats())
                        .seatNumbers(b.getSeatNumbers())
                        .totalAmount(b.getTotalAmount())
                        .transactionRef(b.getTransactionRef())
                        .status(b.getStatus().name())
                        .bookingTime(b.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
