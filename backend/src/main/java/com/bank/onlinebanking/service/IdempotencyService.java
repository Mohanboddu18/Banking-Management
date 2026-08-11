package com.bank.onlinebanking.service;

import com.bank.onlinebanking.entity.IdempotencyKey;
import com.bank.onlinebanking.exception.DuplicateTransactionException;
import com.bank.onlinebanking.repository.IdempotencyKeyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private final IdempotencyKeyRepository idempotencyKeyRepository;

    @Transactional
    public void validateKey(String key, String username, String endpoint) {
        if (key == null || key.trim().isEmpty()) {
            return;
        }

        Optional<IdempotencyKey> existing = idempotencyKeyRepository.findByIdempotencyKey(key);
        if (existing.isPresent()) {
            IdempotencyKey rec = existing.get();
            if (rec.getExpiresAt().isAfter(LocalDateTime.now())) {
                throw new DuplicateTransactionException("Duplicate financial transaction detected with idempotency key: " + key);
            } else {
                idempotencyKeyRepository.delete(rec);
            }
        }

        IdempotencyKey newKey = IdempotencyKey.builder()
                .idempotencyKey(key)
                .username(username)
                .endpoint(endpoint)
                .httpStatusCode(200)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();
        idempotencyKeyRepository.save(newKey);
    }
}
