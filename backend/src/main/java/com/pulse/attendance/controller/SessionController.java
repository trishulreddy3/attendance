package com.pulse.attendance.controller;

import com.pulse.attendance.dto.request.Requests.CreateSessionReq;
import com.pulse.attendance.dto.request.Requests.MarkAttendanceReq;
import com.pulse.attendance.dto.request.Requests.UpdateSessionReq;
import com.pulse.attendance.dto.response.Responses.AttendanceDTO;
import com.pulse.attendance.dto.response.Responses.MessageResponse;
import com.pulse.attendance.dto.response.Responses.QrResponse;
import com.pulse.attendance.dto.response.Responses.SessionDTO;
import com.pulse.attendance.entity.Session;
import com.pulse.attendance.security.UserDetailsImpl;
import com.pulse.attendance.service.AttendanceService;
import com.pulse.attendance.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.lang.String;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;
    private final AttendanceService attendanceService;

    @PostMapping
    @PreAuthorize("hasRole('ROLE_FACULTY')")
    public ResponseEntity<SessionDTO> createSession(
            @Valid @RequestBody CreateSessionReq req,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(sessionService.createSession(userDetails.getId(), req));
    }

    @GetMapping
    @PreAuthorize("hasRole('ROLE_FACULTY')")
    public ResponseEntity<List<SessionDTO>> getFacultySessions(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(sessionService.getFacultySessions(userDetails.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionDTO> getSession(@PathVariable String id) {
        return ResponseEntity.ok(sessionService.getSession(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_FACULTY')")
    public ResponseEntity<SessionDTO> updateSession(
            @PathVariable String id,
            @Valid @RequestBody UpdateSessionReq req,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(sessionService.updateSession(userDetails.getId(), id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_FACULTY')")
    public ResponseEntity<MessageResponse> deleteSession(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        sessionService.deleteSession(userDetails.getId(), id);
        return ResponseEntity.ok(new MessageResponse("Session deleted successfully"));
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasRole('ROLE_FACULTY')")
    public ResponseEntity<SessionDTO> startSession(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        // Typically updates start time to now
        SessionDTO dto = sessionService.updateSession(userDetails.getId(), id,
                new UpdateSessionReq(null, null, null, null, LocalDateTime.now(), null));
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{id}/end")
    @PreAuthorize("hasRole('ROLE_FACULTY')")
    public ResponseEntity<SessionDTO> endSession(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        // Typically updates end time to now
        SessionDTO dto = sessionService.updateSession(userDetails.getId(), id,
                new UpdateSessionReq(null, null, null, null, null, LocalDateTime.now()));
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/active/{branch}")
    @PreAuthorize("hasRole('ROLE_FACULTY') or hasRole('ROLE_STUDENT')")
    public ResponseEntity<List<SessionDTO>> getActiveSessions(@PathVariable String branch) {
        return ResponseEntity.ok(sessionService.getActiveSessions(branch));
    }

    @GetMapping("/{id}/attendance")
    @PreAuthorize("hasRole('ROLE_FACULTY')")
    public ResponseEntity<List<AttendanceDTO>> getSessionAttendance(@PathVariable String id) {
        return ResponseEntity.ok(attendanceService.getSessionAttendance(id));
    }

    @PostMapping("/{id}/attendance")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<MessageResponse> markAttendance(
            @PathVariable String id,
            @Valid @RequestBody MarkAttendanceReq req,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        attendanceService.markAttendance(userDetails.getId(), req);
        return ResponseEntity.ok(new MessageResponse("Attendance marked successfully"));
    }

    @PostMapping("/{id}/qr/refresh")
    @PreAuthorize("hasRole('ROLE_FACULTY')")
    public ResponseEntity<QrResponse> refreshQr(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        String newToken = sessionService.refreshQr(userDetails.getId(), id);
        return ResponseEntity.ok(new QrResponse(newToken, 10)); // 10s refresh interval
    }
}
