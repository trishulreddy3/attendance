package com.pulse.attendance.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
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
        @NotBlank(message = "Name is required") String name,
        @NotBlank(message = "Student ID is required") String studentId,
        String rollNumber,
        @Email(message = "Invalid email format") @NotBlank(message = "Email is required") String email,
        String mobile,
        @NotBlank(message = "Department/Branch is required") String branch,
        String password
    ) {
        public String getEffectiveRollNumber() {
            return (rollNumber != null && !rollNumber.trim().isEmpty()) ? rollNumber.trim() : studentId.trim();
        }
    }

    public record UpdateStudentReq(
        String name,
        String rollNumber,
        String email,
        String mobile,
        String branch,
        String password
    ) {}

    public record PeriodMarkReq(
        @NotBlank(message = "Student ID is required") String studentId,
        @NotNull(message = "Period is required") Integer period,
        @NotBlank(message = "Status is required") String status
    ) {}

    public record SaveDailyAttendanceReq(
        @NotBlank(message = "Department is required") String department,
        @NotNull(message = "Date is required") LocalDate date,
        @NotNull(message = "Attendance entries are required") java.util.List<PeriodMarkReq> entries
    ) {}

    public record BulkMarkDailyReq(
        @NotBlank(message = "Department is required") String department,
        @NotNull(message = "Date is required") LocalDate date,
        @NotBlank(message = "Status is required") String status,
        java.util.List<Integer> periods
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

    public record CreateBatchReq(
            @NotBlank(message = "Batch name is required") String batchName,
            @NotNull(message = "Start date is required") LocalDate startDate,
            @NotNull(message = "End date is required") LocalDate endDate,
            // Faculty fields — either provide existing facultyId OR new faculty details
            String facultyId,           // existing faculty (optional)
            String facultyName,
            String facultyEmail,
            String facultyMobile,
            String facultyPassword
    ) {}
}
