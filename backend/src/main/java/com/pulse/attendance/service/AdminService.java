package com.pulse.attendance.service;

import com.pulse.attendance.dto.request.Requests.AdminAddFacultyReq;
import com.pulse.attendance.dto.request.Requests.UpdateStudentReq;
import com.pulse.attendance.dto.response.Responses.AdminDTO;
import com.pulse.attendance.dto.response.Responses.AdminDashboardDTO;
import com.pulse.attendance.dto.response.Responses.DeviceBindingDTO;
import com.pulse.attendance.dto.response.Responses.FacultyDTO;
import com.pulse.attendance.entity.Admin;
import com.pulse.attendance.entity.DeviceBinding;
import com.pulse.attendance.entity.Faculty;
import com.pulse.attendance.exception.ApiException;
import com.pulse.attendance.mapper.EntityMapper;
import com.pulse.attendance.repository.AdminRepository;
import com.pulse.attendance.repository.AttendanceRepository;
import com.pulse.attendance.repository.BatchRepository;
import com.pulse.attendance.repository.FacultyRepository;
import com.pulse.attendance.repository.SessionRepository;
import com.pulse.attendance.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.Locale;
import com.pulse.attendance.dto.response.Responses.ChartData;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final SessionRepository sessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final DeviceBindingService deviceBindingService;
    private final BatchRepository batchRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityMapper mapper;

    public AdminDTO getAdminProfile(String adminId) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new ApiException("Admin not found", HttpStatus.NOT_FOUND));
        return mapper.toAdminDTO(admin);
    }

    public AdminDashboardDTO getDashboard() {
        long totalFaculty = facultyRepository.count();
        long totalStudents = studentRepository.count();
        long totalSessions = sessionRepository.count();
        long totalAttendance = attendanceRepository.count();
        long totalBatches = batchRepository.count();
        List<FacultyDTO> facultyList = facultyRepository.findAll().stream()
                .map(mapper::toFacultyDTO)
                .collect(Collectors.toList());

        List<ChartData> activityData = new java.util.ArrayList<>();
        LocalDateTime endOfToday = LocalDate.now().atTime(23, 59, 59);
        LocalDateTime startOf7DaysAgo = LocalDate.now().minusDays(6).atStartOfDay();
        
        List<com.pulse.attendance.entity.Attendance> recentAttendances = attendanceRepository.findByMarkedAtBetween(startOf7DaysAgo, endOfToday);
        
        for (int i = 6; i >= 0; i--) {
            LocalDate d = LocalDate.now().minusDays(i);
            String dayName = d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            long count = recentAttendances.stream()
                    .filter(a -> a.getMarkedAt() != null && a.getMarkedAt().toLocalDate().equals(d))
                    .count();
            activityData.add(new ChartData(dayName, (int) count));
        }

        return new AdminDashboardDTO(totalFaculty, totalStudents, totalSessions, totalAttendance, totalBatches, facultyList, activityData);
    }

    @Transactional
    public FacultyDTO addFaculty(AdminAddFacultyReq req) {
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

        return mapper.toFacultyDTO(facultyRepository.save(faculty));
    }

    public List<FacultyDTO> getAllFaculty() {
        return facultyRepository.findAll().stream()
                .map(mapper::toFacultyDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FacultyDTO updateFaculty(String facultyId, UpdateStudentReq req) {
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ApiException("Faculty not found", HttpStatus.NOT_FOUND));

        if (req.name() != null) faculty.setName(req.name());
        if (req.email() != null && !req.email().equals(faculty.getEmail())) {
            if (facultyRepository.existsByEmail(req.email())) {
                throw new ApiException("Email is already in use", HttpStatus.BAD_REQUEST);
            }
            faculty.setEmail(req.email());
        }
        if (req.mobile() != null) faculty.setMobile(req.mobile());
        if (req.branch() != null) faculty.setBranch(req.branch());
        if (req.password() != null) {
            faculty.setPassword(passwordEncoder.encode(req.password()));
        }

        return mapper.toFacultyDTO(facultyRepository.save(faculty));
    }

    @Transactional
    public void deleteFaculty(String facultyId) {
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ApiException("Faculty not found", HttpStatus.NOT_FOUND));
        facultyRepository.delete(faculty);
        // Depending on requirements, we might want to delete their students too or leave them orphaned/reassign.
        // For now we just delete the faculty.
    }

    public List<DeviceBindingDTO> getAllStudentsWithDevices() {
        return studentRepository.findAll().stream().map(student -> {
            DeviceBinding binding = deviceBindingService.getBindingInfo(student.getId()).orElse(null);
            return new DeviceBindingDTO(
                    student.getId(),
                    student.getName() + " (" + student.getStudentId() + ")",
                    binding != null ? binding.getDeviceFingerprint() : null,
                    binding != null ? binding.getBoundAt() : null,
                    binding != null ? "Bound" : "Unbound"
            );
        }).collect(Collectors.toList());
    }
}
