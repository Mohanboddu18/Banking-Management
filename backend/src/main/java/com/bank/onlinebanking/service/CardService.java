package com.bank.onlinebanking.service;

import com.bank.onlinebanking.dto.card.*;
import com.bank.onlinebanking.entity.*;
import com.bank.onlinebanking.entity.enums.CardStatus;
import com.bank.onlinebanking.entity.enums.CardType;
import com.bank.onlinebanking.entity.enums.NotificationType;
import com.bank.onlinebanking.exception.AccountNotFoundException;
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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CardService {

    private final DebitCardRepository debitCardRepository;
    private final CreditCardRepository creditCardRepository;
    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final ReferenceGenerator referenceGenerator;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Transactional
    public DebitCardResponse requestDebitCard(String username, DebitCardRequest req) {
        Account account = accountRepository.findByAccountNumber(req.getAccountNumber())
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + req.getAccountNumber()));

        Customer customer = account.getCustomer();
        if (!customer.getUser().getUsername().equals(username)) {
            throw new BankingOperationException("Access Denied: Account does not belong to user: " + username);
        }

        CardType cardType;
        try {
            cardType = CardType.valueOf(req.getCardType().toUpperCase());
        } catch (Exception e) {
            cardType = CardType.RUPAY_GLOBAL_DEBIT;
        }

        String bin = "4532";
        if (cardType == CardType.RUPAY_GLOBAL_DEBIT) bin = "6071";
        else if (cardType == CardType.MASTERCARD_WORLD_DEBIT) bin = "5241";

        String rawCardNum = referenceGenerator.generateCardNumber(bin);
        String maskedCardNum = referenceGenerator.maskCardNumber(rawCardNum);
        String cvv = referenceGenerator.generateCvv();
        LocalDate expiry = LocalDate.now().plusYears(5);

        String cardHolderName = req.getNameOnCard() != null && !req.getNameOnCard().isEmpty()
                ? req.getNameOnCard().toUpperCase()
                : customer.getFullName().toUpperCase();

        DebitCard card = DebitCard.builder()
                .account(account)
                .cardNumber(rawCardNum)
                .maskedCardNumber(maskedCardNum)
                .cardHolderName(cardHolderName)
                .cardType(cardType)
                .expiryMonth(expiry.getMonthValue())
                .expiryYear(expiry.getYear())
                .cvvHash(passwordEncoder.encode(cvv))
                .dailyLimit(BigDecimal.valueOf(50000.00))
                .internationalUsage(false)
                .contactlessPayment(true)
                .status(CardStatus.ACTIVE)
                .build();

        card = debitCardRepository.save(card);

        auditLogService.logAction(customer.getUser().getId(), username, "ROLE_CUSTOMER", "REQUEST_DEBIT_CARD",
                "DebitCard", card.getId().toString(), null, "SUCCESS",
                "New " + cardType.name() + " card issued ending with " + maskedCardNum.substring(maskedCardNum.length() - 4));

        notificationService.createNotification(customer, "New Debit Card Issued",
                "Your new " + cardType.name() + " (" + maskedCardNum + ") has been activated successfully with daily limit ₹50,000.",
                NotificationType.CARD);

        return mapToDebitCardResponse(card);
    }

    @Transactional
    public DebitCardResponse toggleDebitCardStatus(String username, Long cardId) {
        DebitCard card = debitCardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Debit card not found"));

        if (!card.getAccount().getCustomer().getUser().getUsername().equals(username)) {
            throw new BankingOperationException("Access Denied: You do not own this card");
        }

        if (card.getStatus() == CardStatus.ACTIVE) {
            card.setStatus(CardStatus.BLOCKED);
        } else if (card.getStatus() == CardStatus.BLOCKED) {
            card.setStatus(CardStatus.ACTIVE);
        } else {
            throw new BankingOperationException("Card status is " + card.getStatus() + " and cannot be toggled");
        }

        card = debitCardRepository.save(card);

        auditLogService.logAction(card.getAccount().getCustomer().getUser().getId(), username, "ROLE_CUSTOMER", "TOGGLE_CARD_STATUS",
                "DebitCard", card.getId().toString(), null, "SUCCESS", "Card status changed to: " + card.getStatus());

        notificationService.createNotification(card.getAccount().getCustomer(), "Debit Card Status Updated",
                "Your Debit Card ending in " + card.getMaskedCardNumber().substring(card.getMaskedCardNumber().length() - 4) + " is now " + card.getStatus().name() + ".",
                NotificationType.CARD);

        return mapToDebitCardResponse(card);
    }

    @Transactional
    public void setDebitCardPin(String username, Long cardId, CardPinChangeRequest req) {
        DebitCard card = debitCardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Debit card not found"));

        if (!card.getAccount().getCustomer().getUser().getUsername().equals(username)) {
            throw new BankingOperationException("Access Denied: You do not own this card");
        }

        if (!req.getNewPin().equals(req.getConfirmPin())) {
            throw new BankingOperationException("New PIN and Confirm PIN do not match");
        }

        card.setPinHash(passwordEncoder.encode(req.getNewPin()));
        debitCardRepository.save(card);

        auditLogService.logAction(card.getAccount().getCustomer().getUser().getId(), username, "ROLE_CUSTOMER", "SET_CARD_PIN",
                "DebitCard", card.getId().toString(), null, "SUCCESS", "Card ATM PIN changed successfully");
    }

    @Transactional
    public CreditCardResponse applyCreditCard(String username, CreditCardApplicationRequest req) {
        Customer customer = customerRepository.findByUser_Username(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + username));

        CardType cardType;
        try {
            cardType = CardType.valueOf(req.getCardType().toUpperCase());
        } catch (Exception e) {
            cardType = CardType.SBI_SIMPLICLICK_CREDIT;
        }

        // Limit calculation based on annual income
        BigDecimal annualIncome = customer.getAnnualIncome();
        BigDecimal limit = annualIncome.divide(BigDecimal.valueOf(4), 2, java.math.RoundingMode.HALF_UP);
        if (limit.compareTo(BigDecimal.valueOf(50000.00)) < 0) {
            limit = BigDecimal.valueOf(50000.00);
        }

        String rawCardNum = referenceGenerator.generateCardNumber("5425");
        String maskedCardNum = referenceGenerator.maskCardNumber(rawCardNum);
        String cvv = referenceGenerator.generateCvv();
        LocalDate expiry = LocalDate.now().plusYears(4);

        CreditCard creditCard = CreditCard.builder()
                .customer(customer)
                .cardNumber(rawCardNum)
                .maskedCardNumber(maskedCardNum)
                .cardHolderName(req.getNameOnCard() != null ? req.getNameOnCard().toUpperCase() : customer.getFullName().toUpperCase())
                .cardType(cardType)
                .creditLimit(limit)
                .availableCredit(limit)
                .usedCredit(BigDecimal.ZERO)
                .billingCycleDay(15)
                .paymentDueDate(LocalDate.now().plusMonths(1).withDayOfMonth(5))
                .expiryMonth(expiry.getMonthValue())
                .expiryYear(expiry.getYear())
                .cvvHash(passwordEncoder.encode(cvv))
                .status(CardStatus.ACTIVE)
                .build();

        creditCard = creditCardRepository.save(creditCard);

        auditLogService.logAction(customer.getUser().getId(), username, "ROLE_CUSTOMER", "APPLY_CREDIT_CARD",
                "CreditCard", creditCard.getId().toString(), null, "SUCCESS",
                "Approved and issued " + cardType.name() + " with Limit: ₹" + limit);

        notificationService.createNotification(customer, "Credit Card Approved",
                "Congratulations! Your " + cardType.name() + " (" + maskedCardNum + ") is activated with a credit limit of ₹" + limit + ".",
                NotificationType.CARD);

        return mapToCreditCardResponse(creditCard);
    }

    @Transactional(readOnly = true)
    public List<DebitCardResponse> getCustomerDebitCards(String username) {
        return debitCardRepository.findAllByAccount_Customer_User_Username(username).stream()
                .map(this::mapToDebitCardResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CreditCardResponse> getCustomerCreditCards(String username) {
        return creditCardRepository.findAllByCustomer_User_Username(username).stream()
                .map(this::mapToCreditCardResponse)
                .collect(Collectors.toList());
    }

    public DebitCardResponse mapToDebitCardResponse(DebitCard card) {
        return DebitCardResponse.builder()
                .id(card.getId())
                .accountNumber(card.getAccount().getAccountNumber())
                .maskedCardNumber(card.getMaskedCardNumber())
                .cardHolderName(card.getCardHolderName())
                .cardType(card.getCardType().name())
                .expiryMonth(card.getExpiryMonth())
                .expiryYear(card.getExpiryYear())
                .dailyLimit(card.getDailyLimit())
                .internationalUsage(card.isInternationalUsage())
                .contactlessPayment(card.isContactlessPayment())
                .status(card.getStatus().name())
                .createdAt(card.getCreatedAt())
                .build();
    }

    public CreditCardResponse mapToCreditCardResponse(CreditCard c) {
        return CreditCardResponse.builder()
                .id(c.getId())
                .maskedCardNumber(c.getMaskedCardNumber())
                .cardHolderName(c.getCardHolderName())
                .cardType(c.getCardType().name())
                .creditLimit(c.getCreditLimit())
                .availableCredit(c.getAvailableCredit())
                .usedCredit(c.getUsedCredit())
                .billingCycleDay(c.getBillingCycleDay())
                .paymentDueDate(c.getPaymentDueDate())
                .expiryMonth(c.getExpiryMonth())
                .expiryYear(c.getExpiryYear())
                .status(c.getStatus().name())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
