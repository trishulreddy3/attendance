package com.pulse.attendance.controller;

import com.pulse.attendance.dto.response.Responses.MonthlyClassReportDTO;
import com.pulse.attendance.service.DailyAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports/monthly")
@RequiredArgsConstructor
public class MonthlyReportController {

    private final DailyAttendanceService dailyAttendanceService;

    /**
     * Get monthly attendance report with working periods, present/absent totals,
     * calculated attendance percentage, and configurable low attendance threshold filter.
     */
    @GetMapping
    @PreAuthorize("hasRole('ROLE_FACULTY') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<MonthlyClassReportDTO> getMonthlyReport(
            @RequestParam String department,
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(defaultValue = "75.0") double threshold,
            @RequestParam(required = false, defaultValue = "false") boolean belowThresholdOnly) {
        return ResponseEntity.ok(dailyAttendanceService.getMonthlyReport(department, year, month, threshold, belowThresholdOnly));
    }

    /**
     * Download monthly attendance report as CSV matching PDF layout.
     */
    @GetMapping("/csv")
    @PreAuthorize("hasRole('ROLE_FACULTY') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<byte[]> downloadMonthlyReportCsv(
            @RequestParam String department,
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(defaultValue = "75.0") double threshold) {
        byte[] csv = dailyAttendanceService.generateMonthlyReportCsv(department, year, month, threshold);
        String safeDept = department.replaceAll("[^a-zA-Z0-9.-]", "_");
        String filename = String.format("monthly-report-%s-%04d-%02d.csv", safeDept, year, month);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv);
    }
}
