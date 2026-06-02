package com.pulse.attendance.service;

import com.pulse.attendance.dto.request.Requests.FacultyRegisterReq;
import com.pulse.attendance.dto.request.Requests.LoginReq;
import com.pulse.attendance.dto.response.Responses.AuthResponse;
import com.pulse.attendance.entity.Faculty;
import com.pulse.attendance.entity.Student;
import com.pulse.attendance.exception.ApiException;
import com.pulse.attendance.repository.FacultyRepository;
import com.pulse.attendance.repository.StudentRepository;
import com.pulse.attendance.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Transactional
    public AuthResponse registerFaculty(FacultyRegisterReq req) {
        if (facultyRepository.existsByEmail(req.email())) {
            throw new ApiException("Email is already in use", HttpStatus.BAD_REQUEST);
        }

        Faculty faculty = Faculty.builder()
                .name(req.name())
                .email(req.email())
                .mobile(req.mobile())
                .password(passwordEncoder.encode(req.password()))
                .branch(req.branch())
                .build();

        facultyRepository.save(faculty);

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password())
        );

        SecurityContextHolder.getContext().setAuthentication(auth);
        String jwt = jwtUtils.generateJwtToken(auth);

        return new AuthResponse(jwt, "faculty", faculty.getId());
    }

    public AuthResponse login(LoginReq req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password())
        );

        SecurityContextHolder.getContext().setAuthentication(auth);
        String jwt = jwtUtils.generateJwtToken(auth);
        
        if ("faculty".equalsIgnoreCase(req.kind())) {
            Faculty f = facultyRepository.findByEmail(req.username())
                    .orElseThrow(() -> new ApiException("Faculty not found", HttpStatus.NOT_FOUND));
            return new AuthResponse(jwt, "faculty", f.getId());
        } else {
            Student s = studentRepository.findByStudentId(req.username())
                    .orElseGet(() -> studentRepository.findByEmail(req.username())
                            .orElseThrow(() -> new ApiException("Student not found", HttpStatus.NOT_FOUND)));
            return new AuthResponse(jwt, "student", s.getId());
        }
    }
}
