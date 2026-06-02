package com.pulse.attendance.service;

import com.pulse.attendance.dto.request.Requests.ChangePasswordReq;
import com.pulse.attendance.dto.request.Requests.CreateStudentReq;
import com.pulse.attendance.dto.request.Requests.UpdateStudentReq;
import com.pulse.attendance.dto.response.Responses.StudentDTO;
import com.pulse.attendance.entity.Faculty;
import com.pulse.attendance.entity.Student;
import com.pulse.attendance.exception.ApiException;
import com.pulse.attendance.mapper.EntityMapper;
import com.pulse.attendance.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.lang.String;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final FacultyService facultyService;
    private final EntityMapper mapper;
    private final PasswordEncoder passwordEncoder;

    public Student getStudentEntity(String studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new ApiException("Student not found", HttpStatus.NOT_FOUND));
    }
    
    public StudentDTO getStudentProfile(String studentId) {
        return mapper.toStudentDTO(getStudentEntity(studentId));
    }

    @Transactional
    public StudentDTO createStudent(String facultyId, CreateStudentReq req) {
        if (studentRepository.existsByEmail(req.email())) {
            throw new ApiException("Email already in use", HttpStatus.BAD_REQUEST);
        }
        if (studentRepository.existsByStudentId(req.studentId())) {
            throw new ApiException("Student ID already exists", HttpStatus.BAD_REQUEST);
        }

        Faculty faculty = facultyService.getFacultyEntity(facultyId);

        Student student = Student.builder()
                .studentId(req.studentId())
                .name(req.name())
                .email(req.email())
                .mobile(req.mobile())
                .password(passwordEncoder.encode(req.password()))
                .branch(req.branch())
                .createdBy(faculty)
                .build();

        return mapper.toStudentDTO(studentRepository.save(student));
    }

    @Transactional
    public StudentDTO updateStudent(String facultyId, String studentId, UpdateStudentReq req) {
        Student student = getStudentEntity(studentId);
        
        // Ensure faculty owns this student (if required by business logic, wait, requirement says:
        // "Faculty can only manage students they created."
        if (!student.getCreatedBy().getId().equals(facultyId)) {
            throw new ApiException("You do not have permission to modify this student", HttpStatus.FORBIDDEN);
        }

        return updateStudentProfile(studentId, req);
    }
    
    @Transactional
    public StudentDTO updateStudentProfile(String studentId, UpdateStudentReq req) {
        Student student = getStudentEntity(studentId);

        if (StringUtils.hasText(req.name())) student.setName(req.name());
        if (StringUtils.hasText(req.email()) && !student.getEmail().equals(req.email())) {
            if (studentRepository.existsByEmail(req.email())) {
                throw new ApiException("Email already in use", HttpStatus.BAD_REQUEST);
            }
            student.setEmail(req.email());
        }
        if (StringUtils.hasText(req.mobile())) student.setMobile(req.mobile());
        if (StringUtils.hasText(req.branch())) student.setBranch(req.branch());
        if (StringUtils.hasText(req.password())) student.setPassword(passwordEncoder.encode(req.password()));

        return mapper.toStudentDTO(studentRepository.save(student));
    }

    @Transactional
    public void deleteStudent(String facultyId, String studentId) {
        Student student = getStudentEntity(studentId);
        if (!student.getCreatedBy().getId().equals(facultyId)) {
            throw new ApiException("You do not have permission to modify this student", HttpStatus.FORBIDDEN);
        }
        studentRepository.delete(student);
    }

    public List<StudentDTO> getAllStudents(String facultyId) {
        // Faculty can only view students they created (or all? requirement says manage students they created)
        // Let's assume they only view students they created
        return mapper.toStudentDTOs(studentRepository.findByCreatedById(facultyId));
    }

    public Page<StudentDTO> searchStudents(String facultyId, String q, String branch, Pageable pageable) {
        List<StudentDTO> all = studentRepository.findByNameContainingIgnoreCaseOrStudentIdContainingIgnoreCase(q, q)
                .stream().map(mapper::toStudentDTO)
                .collect(java.util.stream.Collectors.toList());
        
        if (branch != null && !"ALL".equalsIgnoreCase(branch)) {
            all = all.stream().filter(s -> branch.equals(s.branch())).collect(java.util.stream.Collectors.toList());
        }
        
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), all.size());
        if (start > all.size()) return new org.springframework.data.domain.PageImpl<>(new java.util.ArrayList<>(), pageable, all.size());
        return new org.springframework.data.domain.PageImpl<>(all.subList(start, end), pageable, all.size());
    }

    public List<StudentDTO> getStudentsByBranch(String branch) {
        return mapper.toStudentDTOs(studentRepository.findByBranch(branch));
    }

    @Transactional
    public void changePassword(String studentId, ChangePasswordReq req) {
        Student student = getStudentEntity(studentId);
        if (!passwordEncoder.matches(req.oldPassword(), student.getPassword())) {
            throw new ApiException("Incorrect old password", HttpStatus.BAD_REQUEST);
        }
        student.setPassword(passwordEncoder.encode(req.newPassword()));
        studentRepository.save(student);
    }
}
