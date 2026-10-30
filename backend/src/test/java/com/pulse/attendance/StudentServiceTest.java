package com.pulse.attendance;

import com.pulse.attendance.dto.request.Requests.CreateStudentReq;
import com.pulse.attendance.dto.request.Requests.UpdateStudentReq;
import com.pulse.attendance.dto.response.Responses.StudentDTO;
import com.pulse.attendance.entity.Faculty;
import com.pulse.attendance.entity.Student;
import com.pulse.attendance.exception.ApiException;
import com.pulse.attendance.mapper.EntityMapper;
import com.pulse.attendance.repository.StudentRepository;
import com.pulse.attendance.service.FacultyService;
import com.pulse.attendance.service.StudentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private FacultyService facultyService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Spy
    private EntityMapper mapper = Mappers.getMapper(EntityMapper.class);

    @InjectMocks
    private StudentService studentService;

    private Faculty mockFaculty;

    @BeforeEach
    void setUp() {
        mockFaculty = Faculty.builder()
                .id("fac-1")
                .name("Test Faculty")
                .email("faculty@college.edu")
                .build();
    }

    @Test
    @DisplayName("Module 1: Create student with roll number, name, and department")
    void testCreateStudentSuccess() {
        CreateStudentReq req = new CreateStudentReq(
                "Aarav Sharma",
                "STU001",
                "101",
                "aarav@example.com",
                "9876543210",
                "CSE (AI & ML)",
                "password123"
        );

        when(studentRepository.existsByEmail("aarav@example.com")).thenReturn(false);
        when(studentRepository.existsByStudentId("STU001")).thenReturn(false);
        when(studentRepository.existsByRollNumber("101")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_pwd");
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> {
            Student s = invocation.getArgument(0);
            s.setId("generated-id");
            return s;
        });

        StudentDTO created = studentService.createStudent("fac-1", req);

        assertNotNull(created);
        assertEquals("Aarav Sharma", created.name());
        assertEquals("101", created.rollNumber());
        assertEquals("CSE (AI & ML)", created.branch());
        assertEquals("aarav@example.com", created.email());
        verify(studentRepository).save(any(Student.class));
    }

    @Test
    @DisplayName("Module 1: Handle duplicate email or roll number validation")
    void testDuplicateValidation() {
        CreateStudentReq req = new CreateStudentReq(
                "Aarav Sharma",
                "STU001",
                "101",
                "duplicate@example.com",
                "9876543210",
                "CSE",
                "pwd"
        );

        when(studentRepository.existsByEmail("duplicate@example.com")).thenReturn(true);

        ApiException ex = assertThrows(ApiException.class, () ->
                studentService.createStudent("fac-1", req));
        assertTrue(ex.getMessage().contains("Email already in use"));

        when(studentRepository.existsByEmail("duplicate@example.com")).thenReturn(false);
        when(studentRepository.existsByStudentId("STU001")).thenReturn(true);

        ApiException ex2 = assertThrows(ApiException.class, () ->
                studentService.createStudent("fac-1", req));
        assertTrue(ex2.getMessage().contains("Student ID already exists"));
    }

    @Test
    @DisplayName("Module 1: Edit student details when required")
    void testUpdateStudentDetails() {
        Student student = Student.builder()
                .id("stu-1")
                .name("Old Name")
                .rollNumber("101")
                .email("old@example.com")
                .branch("CSE")
                .createdBy(mockFaculty)
                .build();

        when(studentRepository.findById("stu-1")).thenReturn(Optional.of(student));
        when(studentRepository.save(any(Student.class))).thenAnswer(i -> i.getArgument(0));

        UpdateStudentReq updateReq = new UpdateStudentReq(
                "Updated Name",
                "101-A",
                "new@example.com",
                "9999999999",
                "AIML",
                null
        );

        StudentDTO updated = studentService.updateStudent("fac-1", "stu-1", updateReq);

        assertNotNull(updated);
        assertEquals("Updated Name", student.getName());
        assertEquals("101-A", student.getRollNumber());
        assertEquals("new@example.com", student.getEmail());
        assertEquals("AIML", student.getBranch());
    }

    @Test
    @DisplayName("Module 1: Display registered students by department")
    void testGetStudentsByBranch() {
        Student s1 = Student.builder().id("1").name("S1").branch("AIML").rollNumber("101").build();
        Student s2 = Student.builder().id("2").name("S2").branch("AIML").rollNumber("102").build();

        when(studentRepository.findByBranchIgnoreCaseOrderByRollNumberAsc("AIML"))
                .thenReturn(List.of(s1, s2));

        List<StudentDTO> students = studentService.getStudentsByBranch("AIML");

        assertEquals(2, students.size());
        assertEquals("101", students.get(0).rollNumber());
        assertEquals("102", students.get(1).rollNumber());
    }
}
