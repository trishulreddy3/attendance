package com.pulse.attendance.controller;

import com.pulse.attendance.dto.request.Requests.CreateStudentReq;
import com.pulse.attendance.dto.request.Requests.UpdateStudentReq;
import com.pulse.attendance.dto.response.Responses.AttendanceDTO;
import com.pulse.attendance.dto.response.Responses.MessageResponse;
import com.pulse.attendance.dto.response.Responses.StudentDTO;
import com.pulse.attendance.dto.response.Responses.StudentDashboardDTO;
import com.pulse.attendance.security.UserDetailsImpl;
import com.pulse.attendance.service.AttendanceService;
import com.pulse.attendance.service.DashboardService;
import com.pulse.attendance.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.lang.String;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private final AttendanceService attendanceService;
    private final DashboardService dashboardService;

    @PostMapping
    @PreAuthorize("hasRole('ROLE_FACULTY')")
    public ResponseEntity<StudentDTO> createStudent(
            @Valid @RequestBody CreateStudentReq req,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(studentService.createStudent(userDetails.getId(), req));
    }

    @GetMapping
    @PreAuthorize("hasRole('ROLE_FACULTY')")
    public ResponseEntity<List<StudentDTO>> getAllStudents(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(studentService.getAllStudents(userDetails.getId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_FACULTY') or (hasRole('ROLE_STUDENT') and principal.id == #id)")
    public ResponseEntity<StudentDTO> getStudent(@PathVariable String id) {
        return ResponseEntity.ok(studentService.getStudentProfile(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_FACULTY')")
    public ResponseEntity<StudentDTO> updateStudent(
            @PathVariable String id,
            @Valid @RequestBody UpdateStudentReq req,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(studentService.updateStudent(userDetails.getId(), id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_FACULTY')")
    public ResponseEntity<MessageResponse> deleteStudent(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        studentService.deleteStudent(userDetails.getId(), id);
        return ResponseEntity.ok(new MessageResponse("Student deleted successfully"));
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ROLE_FACULTY')")
    public ResponseEntity<Page<StudentDTO>> searchStudents(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String branch,
            Pageable pageable,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(studentService.searchStudents(userDetails.getId(), q, branch, pageable));
    }

    @GetMapping("/branch/{branch}")
    @PreAuthorize("hasRole('ROLE_FACULTY')")
    public ResponseEntity<List<StudentDTO>> getStudentsByBranch(@PathVariable String branch) {
        return ResponseEntity.ok(studentService.getStudentsByBranch(branch));
    }

    @GetMapping("/{id}/attendance")
    @PreAuthorize("hasRole('ROLE_FACULTY') or (hasRole('ROLE_STUDENT') and principal.id == #id)")
    public ResponseEntity<List<AttendanceDTO>> getStudentAttendance(@PathVariable String id) {
        return ResponseEntity.ok(attendanceService.getStudentAttendance(id));
    }

    @GetMapping("/{id}/statistics")
    @PreAuthorize("hasRole('ROLE_FACULTY') or (hasRole('ROLE_STUDENT') and principal.id == #id)")
    public ResponseEntity<StudentDashboardDTO> getStudentStatistics(@PathVariable String id) {
        return ResponseEntity.ok(dashboardService.getStudentDashboard(id));
    }
}
