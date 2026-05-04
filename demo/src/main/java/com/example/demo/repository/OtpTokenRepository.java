package com.example.demo.repository;

import com.example.demo.model.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {

    // Most recent unused code for this email
    Optional<OtpToken> findTopByEmailAndUsedFalseOrderByExpiresAtDesc(String email);

    // Clean up old tokens for an email before issuing a new one
    @Modifying
    @Transactional
    @Query("DELETE FROM OtpToken o WHERE o.email = :email")
    void deleteAllByEmail(String email);
}
