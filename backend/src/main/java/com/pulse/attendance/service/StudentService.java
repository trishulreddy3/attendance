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
        if (!StringUtils.hasText(req.name())) {
            throw new ApiException("Name is required", HttpStatus.BAD_REQUEST);
        }
        if (!StringUtils.hasText(req.studentId())) {
            throw new ApiException("Student ID is required", HttpStatus.BAD_REQUEST);
        }
        if (studentRepository.existsByEmail(req.email())) {
            throw new ApiException("Email already in use", HttpStatus.BAD_REQUEST);
        }
        if (studentRepository.existsByStudentId(req.studentId())) {
            throw new ApiException("Student ID already exists", HttpStatus.BAD_REQUEST);
        }

        String rollNumber = req.getEffectiveRollNumber();
        if (StringUtils.hasText(rollNumber) && studentRepository.existsByRollNumber(rollNumber)) {
            throw new ApiException("Roll number already exists: " + rollNumber, HttpStatus.BAD_REQUEST);
        }

        Faculty faculty = null;
        if (StringUtils.hasText(facultyId)) {
            try {
                faculty = facultyService.getFacultyEntity(facultyId);
            } catch (Exception ignored) {}
        }

        String rawPassword = StringUtils.hasText(req.password()) ? req.password() : "12345678";

        Student student = Student.builder()
                .studentId(req.studentId().trim())
                .rollNumber(rollNumber)
                .name(req.name().trim())
                .email(req.email().trim())
                .mobile(req.mobile())
                .password(passwordEncoder.encode(rawPassword))
                .branch(req.branch().trim())
                .createdBy(faculty)
                .build();

        return mapper.toStudentDTO(studentRepository.save(student));
    }

    @Transactional
    public StudentDTO updateStudent(String facultyId, String studentId, UpdateStudentReq req) {
        Student student = getStudentEntity(studentId);
        
        if (student.getCreatedBy() != null && facultyId != null && !student.getCreatedBy().getId().equals(facultyId)) {
            throw new ApiException("You do not have permission to modify this student", HttpStatus.FORBIDDEN);
        }

        return updateStudentProfile(studentId, req);
    }
    
    @Transactional
    public StudentDTO updateStudentProfile(String studentId, UpdateStudentReq req) {
        Student student = getStudentEntity(studentId);

        if (StringUtils.hasText(req.name())) student.setName(req.name().trim());
        if (StringUtils.hasText(req.rollNumber()) && !req.rollNumber().trim().equals(student.getRollNumber())) {
            if (studentRepository.existsByRollNumber(req.rollNumber().trim())) {
                throw new ApiException("Roll number already in use", HttpStatus.BAD_REQUEST);
            }
            student.setRollNumber(req.rollNumber().trim());
        }
        if (StringUtils.hasText(req.email()) && !student.getEmail().equalsIgnoreCase(req.email().trim())) {
            if (studentRepository.existsByEmail(req.email().trim())) {
                throw new ApiException("Email already in use", HttpStatus.BAD_REQUEST);
            }
            student.setEmail(req.email().trim());
        }
        if (StringUtils.hasText(req.mobile())) student.setMobile(req.mobile().trim());
        if (StringUtils.hasText(req.branch())) student.setBranch(req.branch().trim());
        if (StringUtils.hasText(req.password())) student.setPassword(passwordEncoder.encode(req.password()));

        return mapper.toStudentDTO(studentRepository.save(student));
    }

    @Transactional
    public void deleteStudent(String facultyId, String studentId) {
        Student student = getStudentEntity(studentId);
        if (student.getCreatedBy() != null && facultyId != null && !student.getCreatedBy().getId().equals(facultyId)) {
            throw new ApiException("You do not have permission to modify this student", HttpStatus.FORBIDDEN);
        }
        studentRepository.delete(student);
    }

    @Transactional
    public void deleteStudentAsAdmin(String studentId) {
        Student student = getStudentEntity(studentId);
        studentRepository.delete(student);
    }

    public List<StudentDTO> getAllStudents(String facultyId) {
        return mapper.toStudentDTOs(studentRepository.findAll());
    }

    public Page<StudentDTO> searchStudents(String facultyId, String q, String branch, Pageable pageable) {
        List<StudentDTO> all = (StringUtils.hasText(q) 
                ? studentRepository.findByNameContainingIgnoreCaseOrStudentIdContainingIgnoreCase(q, q)
                : studentRepository.findAll())
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
        if (!StringUtils.hasText(branch) || "ALL".equalsIgnoreCase(branch)) {
            return mapper.toStudentDTOs(studentRepository.findAll());
        }
        List<Student> list = studentRepository.findByBranchIgnoreCaseOrderByRollNumberAsc(branch);
        if (list.isEmpty()) {
            list = studentRepository.findByBranch(branch);
        }
        return mapper.toStudentDTOs(list);
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
