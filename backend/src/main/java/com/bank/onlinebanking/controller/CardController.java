package com.bank.onlinebanking.controller;

import com.bank.onlinebanking.dto.card.*;
import com.bank.onlinebanking.dto.common.ApiResponse;
import com.bank.onlinebanking.service.CardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
@Tag(name = "Debit & Credit Cards", description = "Endpoints for Debit and Credit Card Management, PIN Setup, and Status Updates")
public class CardController {

    private final CardService cardService;

    @GetMapping("/debit")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Get Customer Debit Cards")
    public ResponseEntity<ApiResponse<List<DebitCardResponse>>> getDebitCards(Authentication authentication) {
        List<DebitCardResponse> cards = cardService.getCustomerDebitCards(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(cards));
    }

    @PostMapping("/debit/request")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Request New Debit Card")
    public ResponseEntity<ApiResponse<DebitCardResponse>> requestDebitCard(@Valid @RequestBody DebitCardRequest req, Authentication authentication) {
        DebitCardResponse response = cardService.requestDebitCard(authentication.getName(), req);
        return new ResponseEntity<>(ApiResponse.ok(response, "Debit card issued successfully!"), HttpStatus.CREATED);
    }

    @PutMapping("/debit/{id}/toggle-status")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Block or Unblock Debit Card")
    public ResponseEntity<ApiResponse<DebitCardResponse>> toggleCardStatus(@PathVariable Long id, Authentication authentication) {
        DebitCardResponse response = cardService.toggleDebitCardStatus(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.ok(response, "Card status updated to " + response.getStatus()));
    }

    @PostMapping("/debit/{id}/pin")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Set or Change Card ATM PIN")
    public ResponseEntity<ApiResponse<String>> setCardPin(@PathVariable Long id, @Valid @RequestBody CardPinChangeRequest req, Authentication authentication) {
        cardService.setDebitCardPin(authentication.getName(), id, req);
        return ResponseEntity.ok(ApiResponse.ok("Card ATM PIN updated successfully!"));
    }

    @GetMapping("/credit")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Get Customer Credit Cards")
    public ResponseEntity<ApiResponse<List<CreditCardResponse>>> getCreditCards(Authentication authentication) {
        List<CreditCardResponse> cards = cardService.getCustomerCreditCards(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(cards));
    }

    @PostMapping("/credit/apply")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    @Operation(summary = "Apply for Credit Card")
    public ResponseEntity<ApiResponse<CreditCardResponse>> applyCreditCard(@Valid @RequestBody CreditCardApplicationRequest req, Authentication authentication) {
        CreditCardResponse response = cardService.applyCreditCard(authentication.getName(), req);
        return new ResponseEntity<>(ApiResponse.ok(response, "Credit card approved and issued!"), HttpStatus.CREATED);
    }
}
