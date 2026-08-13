package com.bank.onlinebanking.config;

import com.bank.onlinebanking.security.JwtAuthEntryPoint;
import com.bank.onlinebanking.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthEntryPoint unauthorizedHandler;
    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Angular SPA Static Assets & SPA Routes
                        .requestMatchers(
                                "/", "/index.html", "/favicon.ico", "/error", "/3rdpartylicenses.txt",
                                "/assets/**", "/*.js", "/*.css", "/*.ico", "/*.txt", "/*.png", "/*.jpg", "/*.jpeg", "/*.svg", "/*.woff", "/*.woff2", "/*.ttf",
                                "/auth", "/auth/**", "/customer", "/customer/**", "/employee", "/employee/**", "/manager", "/manager/**"
                        ).permitAll()
                        
                        // Public Backend REST endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/actuator/**", "/actuator/health", "/api/health").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/vas/movies/cities", "/api/vas/movies/shows/**", "/api/vas/recharge/operators").permitAll()
                        
                        // Manager REST endpoints
                        .requestMatchers("/api/manager/**").hasAnyAuthority("ROLE_MANAGER", "ROLE_ADMIN")
                        
                        // Employee REST endpoints
                        .requestMatchers("/api/employee/**").hasAnyAuthority(
                                "ROLE_MANAGER", "ROLE_EMPLOYEE_ASST_MANAGER", "ROLE_EMPLOYEE_CASHIER",
                                "ROLE_EMPLOYEE_LOAN_OFFICER", "ROLE_EMPLOYEE_CUSTOMER_SERVICE", "ROLE_EMPLOYEE_OPERATIONS", "ROLE_ADMIN"
                        )
                        
                        // Customer & Authenticated REST endpoints
                        .anyRequest().authenticated()
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
