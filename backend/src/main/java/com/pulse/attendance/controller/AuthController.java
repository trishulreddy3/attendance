package com.pulse.attendance.controller;

import com.pulse.attendance.dto.request.Requests.ChangePasswordReq;
import com.pulse.attendance.dto.request.Requests.FacultyRegisterReq;
import com.pulse.attendance.dto.request.Requests.LoginReq;
import com.pulse.attendance.dto.response.Responses.AuthResponse;
import com.pulse.attendance.dto.response.Responses.MessageResponse;
import com.pulse.attendance.security.UserDetailsImpl;
import com.pulse.attendance.service.AuthService;
import com.pulse.attendance.service.FacultyService;
import com.pulse.attendance.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final FacultyService facultyService;
    private final StudentService studentService;

    @PostMapping("/register/faculty")
    public ResponseEntity<AuthResponse> registerFaculty(@Valid @RequestBody FacultyRegisterReq req) {
        return ResponseEntity.ok(authService.registerFaculty(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginReq req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if ("ROLE_FACULTY".equals(userDetails.getRole())) {
            return ResponseEntity.ok(facultyService.getFacultyProfile(userDetails.getId()));
        } else {
            return ResponseEntity.ok(studentService.getStudentProfile(userDetails.getId()));
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<MessageResponse> changePassword(
            @Valid @RequestBody ChangePasswordReq req,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        if ("ROLE_FACULTY".equals(userDetails.getRole())) {
            facultyService.changePassword(userDetails.getId(), req);
        } else {
            studentService.changePassword(userDetails.getId(), req);
        }
        return ResponseEntity.ok(new MessageResponse("Password updated successfully"));
    }
}
