package com.pulse.attendance.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Requests {
    public record AdminAddFacultyReq(
            @NotBlank(message = "Name is required") String name,
            @NotBlank(message = "Email is required") @Email(message = "Invalid email") String email,
            @NotBlank(message = "Mobile is required") String mobile,
            @NotBlank(message = "Password is required") String password,
            @NotBlank(message = "Branch is required") String branch
    ) {}

    public record AdminResetDeviceReq(
            @NotBlank(message = "Student ID is required") String studentId
    ) {}

    public record LoginReq(
            @NotBlank(message = "Username/Email is required") String username,
            @NotBlank(message = "Password is required") String password,
            @NotBlank(message = "Kind is required") String kind,
            String deviceFingerprint
    ) {}
    
    public record ChangePasswordReq(
        @NotBlank String oldPassword,
        @NotBlank String newPassword
    ) {}

    public record CreateStudentReq(
        @NotBlank String name,
        @NotBlank String studentId,
        @Email @NotBlank String email,
        @NotBlank String mobile,
        @NotBlank String branch,
        @NotBlank String password
    ) {}

    public record UpdateStudentReq(
        String name,
        String email,
        String mobile,
        String branch,
        String password
    ) {}

    public record CreateSessionReq(
        @NotBlank String name,
        @NotBlank String subject,
        @NotBlank String branch,
        @NotBlank String type, // single, multiple, half, full
        @NotNull LocalDateTime startTime,
        @NotNull LocalDateTime endTime,
        BigDecimal latitude,
        BigDecimal longitude
    ) {}

    public record UpdateSessionReq(
        String name,
        String subject,
        String branch,
        String type,
        LocalDateTime startTime,
        LocalDateTime endTime
    ) {}

    public record MarkAttendanceReq(
            @NotBlank(message = "Session ID is required") String sessionId,
            @NotBlank(message = "QR Token is required") String qrToken,
            @NotNull(message = "Latitude is required") BigDecimal latitude,
            @NotNull(message = "Longitude is required") BigDecimal longitude,
            @NotBlank(message = "Device Fingerprint is required") String deviceFingerprint
    ) {}
}
