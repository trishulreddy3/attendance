package com.pulse.attendance.controller;

import com.pulse.attendance.dto.request.Requests.BulkMarkDailyReq;
import com.pulse.attendance.dto.request.Requests.SaveDailyAttendanceReq;
import com.pulse.attendance.dto.response.Responses.DailyAttendanceGridDTO;
import com.pulse.attendance.dto.response.Responses.MessageResponse;
import com.pulse.attendance.entity.DailyPeriodAttendance;
import com.pulse.attendance.security.UserDetailsImpl;
import com.pulse.attendance.service.DailyAttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/daily-attendance")
@RequiredArgsConstructor
public class DailyAttendanceController {

    private final DailyAttendanceService dailyAttendanceService;

    /**
     * Retrieve the 7-period daily grid for a department on a given date.
     */
    @GetMapping({"", "/grid"})
    @PreAuthorize("hasRole('ROLE_FACULTY') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<DailyAttendanceGridDTO> getDailyGrid(
            @RequestParam String department,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(dailyAttendanceService.getDailyGrid(department, date));
    }

    /**
     * Save daily attendance records across periods 1 to 7 (with upsert and duplicate prevention).
     */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_FACULTY') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<DailyAttendanceGridDTO> saveDailyAttendance(
            @Valid @RequestBody SaveDailyAttendanceReq req,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        String faculty = userDetails != null ? userDetails.getUsername() : "FACULTY";
        return ResponseEntity.ok(dailyAttendanceService.saveDailyAttendance(req, faculty));
    }

    /**
     * Bulk mark all present or all absent across specified periods for a department on a date.
     */
    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ROLE_FACULTY') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<MessageResponse> bulkMark(
            @Valid @RequestBody BulkMarkDailyReq req,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        String faculty = userDetails != null ? userDetails.getUsername() : "FACULTY";
        int count = dailyAttendanceService.bulkMarkAttendance(req, faculty);
        return ResponseEntity.ok(new MessageResponse("Successfully updated " + count + " period slots"));
    }

    /**
     * View daily attendance history between two dates.
     */
    @GetMapping("/history")
    @PreAuthorize("hasRole('ROLE_FACULTY') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<DailyPeriodAttendance>> getHistory(
            @RequestParam String department,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(dailyAttendanceService.getHistory(department, startDate, endDate));
    }
}
