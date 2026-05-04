package com.example.demo.service;

import com.example.demo.model.OtpToken;
import com.example.demo.repository.OtpTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private static final int    OTP_LENGTH      = 6;
    private static final int    EXPIRY_MINUTES  = 5;
    private static final String FROM_ADDRESS    = "noreply@ev-charge.tn";

    private final OtpTokenRepository otpTokenRepository;
    private final JavaMailSender     mailSender;
    private final SecureRandom       secureRandom = new SecureRandom();

    /**
     * Generates a new OTP, persists it, and sends it by email.
     * Any previous tokens for this email are deleted first.
     */
    @Transactional
    public void sendOtp(String email) {
        // Invalidate previous codes
        otpTokenRepository.deleteAllByEmail(email);

        String code      = generateCode();
        LocalDateTime exp = LocalDateTime.now().plusMinutes(EXPIRY_MINUTES);
        otpTokenRepository.save(new OtpToken(email, code, exp));

        sendEmail(email, code);
        log.info("OTP sent to {}", email);
    }

    /**
     * Returns true if the code is valid, unused, and not expired.
     * Marks the token as used on success.
     */
    @Transactional
    public boolean verifyOtp(String email, String code) {
        return otpTokenRepository
                .findTopByEmailAndUsedFalseOrderByExpiresAtDesc(email)
                .filter(t -> !t.isExpired())
                .filter(t -> t.getCode().equals(code))
                .map(t -> {
                    t.setUsed(true);
                    otpTokenRepository.save(t);
                    return true;
                })
                .orElse(false);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String generateCode() {
        int n = secureRandom.nextInt(1_000_000);
        return String.format("%06d", n);
    }

    private void sendEmail(String to, String code) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(FROM_ADDRESS);
        msg.setTo(to);
        msg.setSubject("Votre code de vérification EV Charge");
        msg.setText(
            "Bonjour,\n\n" +
            "Votre code de vérification est : " + code + "\n\n" +
            "Ce code est valable " + EXPIRY_MINUTES + " minutes.\n\n" +
            "Si vous n'avez pas demandé ce code, ignorez cet email.\n\n" +
            "— L'équipe EV Charge"
        );
        mailSender.send(msg);
    }
}
