package com.pulse.attendance.service;

import com.pulse.attendance.dto.request.Requests.LoginReq;
import com.pulse.attendance.dto.response.Responses.AuthResponse;
import com.pulse.attendance.entity.Admin;
import com.pulse.attendance.entity.Faculty;
import com.pulse.attendance.entity.Student;
import com.pulse.attendance.exception.ApiException;
import com.pulse.attendance.repository.AdminRepository;
import com.pulse.attendance.repository.FacultyRepository;
import com.pulse.attendance.repository.StudentRepository;
import com.pulse.attendance.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final AdminRepository adminRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final DeviceBindingService deviceBindingService;
    private final JwtUtils jwtUtils;

    public AuthResponse login(LoginReq req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password())
        );

        SecurityContextHolder.getContext().setAuthentication(auth);
        String jwt = jwtUtils.generateJwtToken(auth);
        
        if ("admin".equalsIgnoreCase(req.kind())) {
            Admin a = adminRepository.findByEmail(req.username())
                    .orElseThrow(() -> new ApiException("Admin not found", HttpStatus.NOT_FOUND));
            return new AuthResponse(jwt, "admin", a.getId());
        } else if ("faculty".equalsIgnoreCase(req.kind())) {
            Faculty f = facultyRepository.findByEmail(req.username())
                    .orElseThrow(() -> new ApiException("Faculty not found", HttpStatus.NOT_FOUND));
            return new AuthResponse(jwt, "faculty", f.getId());
        } else {
            Student s = studentRepository.findByStudentId(req.username())
                    .orElseGet(() -> studentRepository.findByEmail(req.username())
                            .orElseThrow(() -> new ApiException("Student not found", HttpStatus.NOT_FOUND)));
            
            // Validate device binding for students
            deviceBindingService.validateAndBindDevice(s.getId(), req.deviceFingerprint());
            
            return new AuthResponse(jwt, "student", s.getId());
        }
    }
}
