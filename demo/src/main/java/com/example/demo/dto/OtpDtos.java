package com.example.demo.dto;

public class OtpDtos {

    public record SendRequest(String email) {}

    public record VerifyRequest(String email, String code) {}

    public record ErrorResponse(String message) {}
}
