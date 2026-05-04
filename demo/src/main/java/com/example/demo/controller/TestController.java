package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/public/hello")
    public String publicHello() {
        return "Public endpoint works";
    }

    @GetMapping("/user/hello")
    public String userHello() {
        return "User endpoint works";
    }

    @GetMapping("/admin/hello")
    public String adminHello() {
        return "Admin endpoint works";
    }
}
