package com.pulse.attendance.controller;

import com.pulse.attendance.dto.request.Requests.UpdateStudentReq;
import com.pulse.attendance.dto.response.Responses.FacultyDTO;
import com.pulse.attendance.dto.response.Responses.FacultyDashboardDTO;
import com.pulse.attendance.dto.response.Responses.ReportDTO;
import com.pulse.attendance.security.UserDetailsImpl;
import com.pulse.attendance.service.DashboardService;
import com.pulse.attendance.service.FacultyService;
import com.pulse.attendance.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/faculty")
@PreAuthorize("hasRole('ROLE_FACULTY')")
@RequiredArgsConstructor
public class FacultyController {

    private final FacultyService facultyService;
    private final DashboardService dashboardService;
    private final ReportService reportService;

    @GetMapping("/profile")
    public ResponseEntity<FacultyDTO> getProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(facultyService.getFacultyProfile(userDetails.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<FacultyDTO> updateProfile(
            @Valid @RequestBody UpdateStudentReq req, // same shape
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(facultyService.updateFacultyProfile(userDetails.getId(), req));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<FacultyDashboardDTO> getDashboard(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(dashboardService.getFacultyDashboard(userDetails.getId()));
    }

    @GetMapping("/reports")
    public ResponseEntity<ReportDTO> getReports(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(reportService.getFacultyReports(userDetails.getId()));
    }
}
