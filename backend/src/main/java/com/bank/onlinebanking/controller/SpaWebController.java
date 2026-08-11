package com.bank.onlinebanking.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaWebController {

    @GetMapping(value = {
        "/",
        "/auth",
        "/auth/**",
        "/customer",
        "/customer/**",
        "/employee",
        "/employee/**",
        "/manager",
        "/manager/**"
    })
    public String forwardSpaRoutes() {
        return "forward:/index.html";
    }
}
