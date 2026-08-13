package com.bank.onlinebanking.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@Tag(name = "Health Check", description = "Public API Health Check Endpoint")
public class HealthController {

    @GetMapping("/api/health")
    @Operation(summary = "Backend API Health Check", description = "Returns system running status and current timestamp.")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Your API is running");
        response.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(response);
    }
}
