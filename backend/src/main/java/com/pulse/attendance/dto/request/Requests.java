package com.pulse.attendance.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Requests {
    public record FacultyRegisterReq(
        @NotBlank String name,
        @Email @NotBlank String email,
        @NotBlank String mobile,
        @NotBlank String password,
        @NotBlank String branch
    ) {}

    public record LoginReq(
        @NotBlank String username, // email or studentId
        @NotBlank String password,
        @NotBlank String kind // "faculty" or "student"
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
        @NotNull java.lang.String sessionId,
        @NotBlank java.lang.String qrToken,
        BigDecimal latitude,
        BigDecimal longitude
    ) {}
}
