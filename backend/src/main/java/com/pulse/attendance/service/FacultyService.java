package com.pulse.attendance.service;

import com.pulse.attendance.dto.request.Requests.ChangePasswordReq;
import com.pulse.attendance.dto.request.Requests.UpdateStudentReq;
import com.pulse.attendance.dto.response.Responses.FacultyDTO;
import com.pulse.attendance.entity.Faculty;
import com.pulse.attendance.exception.ApiException;
import com.pulse.attendance.mapper.EntityMapper;
import com.pulse.attendance.repository.FacultyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.lang.String;

@Service
@RequiredArgsConstructor
public class FacultyService {

    private final FacultyRepository facultyRepository;
    private final EntityMapper mapper;
    private final PasswordEncoder passwordEncoder;

    public Faculty getFacultyEntity(String facultyId) {
        return facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ApiException("Faculty not found", HttpStatus.NOT_FOUND));
    }

    public FacultyDTO getFacultyProfile(String facultyId) {
        return mapper.toFacultyDTO(getFacultyEntity(facultyId));
    }

    @Transactional
    public FacultyDTO updateFacultyProfile(String facultyId, UpdateStudentReq req) {
        Faculty faculty = getFacultyEntity(facultyId);

        if (StringUtils.hasText(req.name())) {
            faculty.setName(req.name());
        }
        if (StringUtils.hasText(req.email()) && !faculty.getEmail().equals(req.email())) {
            if (facultyRepository.existsByEmail(req.email())) {
                throw new ApiException("Email already in use", HttpStatus.BAD_REQUEST);
            }
            faculty.setEmail(req.email());
        }
        if (StringUtils.hasText(req.mobile())) {
            faculty.setMobile(req.mobile());
        }
        if (StringUtils.hasText(req.branch())) {
            faculty.setBranch(req.branch());
        }

        return mapper.toFacultyDTO(facultyRepository.save(faculty));
    }

    @Transactional
    public void changePassword(String facultyId, ChangePasswordReq req) {
        Faculty faculty = getFacultyEntity(facultyId);
        
        if (!passwordEncoder.matches(req.oldPassword(), faculty.getPassword())) {
            throw new ApiException("Incorrect old password", HttpStatus.BAD_REQUEST);
        }
        
        faculty.setPassword(passwordEncoder.encode(req.newPassword()));
        facultyRepository.save(faculty);
    }
}
