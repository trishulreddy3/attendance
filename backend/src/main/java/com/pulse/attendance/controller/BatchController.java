package com.pulse.attendance.controller;

import com.pulse.attendance.dto.request.Requests.CreateBatchReq;
import com.pulse.attendance.dto.response.Responses.*;
import com.pulse.attendance.service.BatchService;
import com.pulse.attendance.service.ExcelService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/batch")
@PreAuthorize("hasRole('ROLE_ADMIN')")
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;
    private final ExcelService excelService;

    // ── List all batches ───────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<BatchDTO>> getAllBatches() {
        return ResponseEntity.ok(batchService.getAllBatches());
    }

    // ── Get single batch ───────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<BatchDTO> getBatch(@PathVariable String id) {
        return ResponseEntity.ok(batchService.getBatch(id));
    }

    // ── Create batch (multipart: metadata JSON + Excel file) ──────────────────
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BatchImportResultDTO> createBatch(
            @RequestPart("data") String dataJson,
            @RequestPart("file") MultipartFile file) throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        CreateBatchReq req = mapper.readValue(dataJson, CreateBatchReq.class);

        BatchImportResultDTO result = batchService.createBatch(req, file);
        return ResponseEntity.ok(result);
    }

    // ── Get students in batch ──────────────────────────────────────────────────
    @GetMapping("/{id}/students")
    public ResponseEntity<List<StudentDTO>> getBatchStudents(@PathVariable String id) {
        return ResponseEntity.ok(batchService.getBatchStudents(id));
    }

    // ── Get attendance grid ────────────────────────────────────────────────────
    @GetMapping("/{id}/attendance")
    public ResponseEntity<BatchAttendanceGridDTO> getAttendanceGrid(@PathVariable String id) {
        return ResponseEntity.ok(batchService.getAttendanceGrid(id));
    }

    // ── Download initial batch creation report ─────────────────────────────────
    @PostMapping("/{id}/report/creation")
    public ResponseEntity<byte[]> downloadCreationReport(
            @PathVariable String id,
            @RequestBody List<StudentWithPasswordDTO> students) {
        byte[] data = excelService.generateBatchCreationReport(id, students);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"batch-creation-report.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    // ── Download attendance report (latest data) ───────────────────────────────
    @GetMapping("/{id}/report/download")
    public ResponseEntity<byte[]> downloadAttendanceReport(@PathVariable String id) {
        byte[] data = excelService.generateAttendanceReport(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"attendance-report.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    // ── Download blank student template ───────────────────────────────────────
    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        byte[] data = excelService.generateStudentTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"student-upload-template.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    // ── Delete batch ──────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteBatch(@PathVariable String id) {
        batchService.deleteBatch(id);
        return ResponseEntity.ok(new MessageResponse("Batch deleted successfully"));
    }
}
