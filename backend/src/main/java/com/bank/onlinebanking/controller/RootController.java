package com.bank.onlinebanking.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@Tag(name = "Root Status", description = "Backend Root Status & API Directory")
public class RootController {

    @GetMapping("/")
    @Operation(summary = "Backend Status & Welcome Page", description = "Returns system information and links to Swagger UI & Health Check")
    public ResponseEntity<Map<String, Object>> getRootStatus() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("service", "Godavari Bank Online Management System - Backend API");
        response.put("version", "1.0.0");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("database", "MySQL 8.4 (Aiven Cloud Connected)");
        
        Map<String, String> links = new LinkedHashMap<>();
        links.put("swagger_documentation", "/swagger-ui.html");
        links.put("actuator_health", "/actuator/health");
        links.put("auth_login", "/api/auth/login");
        links.put("auth_register", "/api/auth/register");
        response.put("endpoints", links);

        response.put("message", "Welcome to Godavari Bank Backend API! For interactive API testing, visit /swagger-ui.html.");
        return ResponseEntity.ok(response);
    }
}
