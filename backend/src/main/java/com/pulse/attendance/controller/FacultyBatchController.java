package com.pulse.attendance.controller;

import com.pulse.attendance.dto.response.Responses.*;
import com.pulse.attendance.security.UserDetailsImpl;
import com.pulse.attendance.service.BatchService;
import com.pulse.attendance.service.ExcelService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faculty/batches")
@PreAuthorize("hasRole('ROLE_FACULTY')")
@RequiredArgsConstructor
public class FacultyBatchController {

    private final BatchService batchService;
    private final ExcelService excelService;

    // ── Faculty's assigned batches ─────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<BatchDTO>> getMyBatches(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(batchService.getBatchesForFaculty(userDetails.getId()));
    }

    // ── Batch detail ───────────────────────────────────────────────────────────
    @GetMapping("/{batchId}")
    public ResponseEntity<BatchDTO> getBatch(
            @PathVariable String batchId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        // Verify faculty is assigned to this batch
        var myBatches = batchService.getBatchesForFaculty(userDetails.getId());
        boolean authorized = myBatches.stream().anyMatch(b -> b.id().equals(batchId));
        if (!authorized) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(batchService.getBatch(batchId));
    }

    // ── Students in batch ──────────────────────────────────────────────────────
    @GetMapping("/{batchId}/students")
    public ResponseEntity<List<StudentDTO>> getBatchStudents(
            @PathVariable String batchId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        assertFacultyOwns(batchId, userDetails.getId());
        return ResponseEntity.ok(batchService.getBatchStudents(batchId));
    }

    // ── Attendance grid ────────────────────────────────────────────────────────
    @GetMapping("/{batchId}/attendance")
    public ResponseEntity<BatchAttendanceGridDTO> getAttendanceGrid(
            @PathVariable String batchId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        assertFacultyOwns(batchId, userDetails.getId());
        return ResponseEntity.ok(batchService.getAttendanceGrid(batchId));
    }

    // ── Mark single attendance ─────────────────────────────────────────────────
    @PutMapping("/{batchId}/attendance")
    public ResponseEntity<BatchAttendanceRecordDTO> markAttendance(
            @PathVariable String batchId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        assertFacultyOwns(batchId, userDetails.getId());
        String studentId = body.get("studentId");
        LocalDate date = LocalDate.parse(body.get("date"));
        String session = body.get("session");
        String status = body.get("status");
        return ResponseEntity.ok(batchService.markAttendance(batchId, studentId, date, session, status));
    }

    // ── Bulk mark (all students, specific date+session) ────────────────────────
    @PutMapping("/{batchId}/attendance/bulk")
    public ResponseEntity<MessageResponse> bulkMark(
            @PathVariable String batchId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        assertFacultyOwns(batchId, userDetails.getId());
        LocalDate date = LocalDate.parse(body.get("date"));
        String session = body.get("session");
        String status = body.get("status");
        batchService.bulkMarkAttendance(batchId, date, session, status);
        return ResponseEntity.ok(new MessageResponse("Bulk attendance marked successfully"));
    }

    // ── Download report ────────────────────────────────────────────────────────
    @GetMapping("/{batchId}/report/download")
    public ResponseEntity<byte[]> downloadReport(
            @PathVariable String batchId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        assertFacultyOwns(batchId, userDetails.getId());
        byte[] data = excelService.generateAttendanceReport(batchId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"attendance-report.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private void assertFacultyOwns(String batchId, String facultyId) {
        boolean owns = batchService.getBatchesForFaculty(facultyId).stream()
                .anyMatch(b -> b.id().equals(batchId));
        if (!owns) throw new com.pulse.attendance.exception.ApiException(
                "Access denied: batch not assigned to you", org.springframework.http.HttpStatus.FORBIDDEN);
    }
}
