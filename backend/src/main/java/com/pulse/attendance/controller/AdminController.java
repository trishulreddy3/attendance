package com.pulse.attendance.controller;

import com.pulse.attendance.dto.request.Requests.AdminAddFacultyReq;
import com.pulse.attendance.dto.request.Requests.UpdateStudentReq;
import com.pulse.attendance.dto.response.Responses.AdminDashboardDTO;
import com.pulse.attendance.dto.response.Responses.DeviceBindingDTO;
import com.pulse.attendance.dto.response.Responses.FacultyDTO;
import com.pulse.attendance.dto.response.Responses.MessageResponse;
import com.pulse.attendance.service.AdminService;
import com.pulse.attendance.service.DeviceBindingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ROLE_ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final DeviceBindingService deviceBindingService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDTO> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    @PostMapping("/faculty")
    public ResponseEntity<FacultyDTO> addFaculty(@Valid @RequestBody AdminAddFacultyReq req) {
        return ResponseEntity.ok(adminService.addFaculty(req));
    }

    @GetMapping("/faculty")
    public ResponseEntity<List<FacultyDTO>> getAllFaculty() {
        return ResponseEntity.ok(adminService.getAllFaculty());
    }

    @PutMapping("/faculty/{id}")
    public ResponseEntity<FacultyDTO> updateFaculty(
            @PathVariable String id,
            @Valid @RequestBody UpdateStudentReq req) {
        return ResponseEntity.ok(adminService.updateFaculty(id, req));
    }

    @DeleteMapping("/faculty/{id}")
    public ResponseEntity<MessageResponse> deleteFaculty(@PathVariable String id) {
        adminService.deleteFaculty(id);
        return ResponseEntity.ok(new MessageResponse("Faculty deleted successfully"));
    }

    @GetMapping("/students")
    public ResponseEntity<List<DeviceBindingDTO>> getAllStudents() {
        return ResponseEntity.ok(adminService.getAllStudentsWithDevices());
    }

    @PostMapping("/students/{id}/reset-device")
    public ResponseEntity<MessageResponse> resetStudentDevice(@PathVariable String id) {
        deviceBindingService.resetDevice(id);
        return ResponseEntity.ok(new MessageResponse("Device binding reset successfully"));
    }
}
