package com.example.demo.controller;

import com.example.demo.dto.OtpDtos;
import com.example.demo.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/otp")
@RequiredArgsConstructor
public class OtpController {

    private final OtpService otpService;

    /**
     * POST /api/otp/send
     * Body: { "email": "user@example.com" }
     * Generates a 6-digit code and emails it to the user.
     * Always returns 200 (don't leak whether the email exists).
     */
    @PostMapping("/send")
    public ResponseEntity<Void> send(@RequestBody OtpDtos.SendRequest req) {
        if (req.email() == null || req.email().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        otpService.sendOtp(req.email().trim().toLowerCase());
        return ResponseEntity.ok().build();
    }

    /**
     * POST /api/otp/verify
     * Body: { "email": "user@example.com", "code": "123456" }
     * Returns 200 on success, 400 with message on failure.
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody OtpDtos.VerifyRequest req) {
        if (req.email() == null || req.code() == null) {
            return ResponseEntity.badRequest()
                    .body(new OtpDtos.ErrorResponse("Email et code requis."));
        }

        boolean valid = otpService.verifyOtp(
                req.email().trim().toLowerCase(),
                req.code().trim()
        );

        if (valid) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest()
                .body(new OtpDtos.ErrorResponse("Code incorrect ou expiré. Veuillez réessayer."));
    }
}
