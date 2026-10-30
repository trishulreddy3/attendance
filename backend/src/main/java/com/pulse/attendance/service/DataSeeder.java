package com.pulse.attendance.service;

import com.pulse.attendance.entity.Admin;
import com.pulse.attendance.entity.Faculty;
import com.pulse.attendance.repository.AdminRepository;
import com.pulse.attendance.repository.FacultyRepository;
import com.pulse.attendance.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedAdmin();
        seedFaculty();
        backfillLegacyStudents();
    }

    private void seedAdmin() {
        if (!adminRepository.existsByEmail("collegeadmin@gmail.com")) {
            Admin admin = Admin.builder()
                    .name("College Admin")
                    .email("collegeadmin@gmail.com")
                    .password(passwordEncoder.encode("admin@vjit"))
                    .build();
            adminRepository.save(admin);
            log.info("Default Admin account seeded successfully.");
        } else {
            log.info("Admin account already exists.");
        }
    }

    private void seedFaculty() {
        if (!facultyRepository.existsByEmail("faculty@pulse.com")) {
            Faculty faculty = Faculty.builder()
                    .name("Faculty User")
                    .email("faculty@pulse.com")
                    .password(passwordEncoder.encode("faculty123"))
                    .branch("CSE")
                    .mobile("9876543210")
                    .build();
            facultyRepository.save(faculty);
            log.info("Default Faculty test account seeded successfully.");
        } else {
            log.info("Faculty test account already exists.");
        }
    }

    private void backfillLegacyStudents() {
        var students = studentRepository.findAll();
        for (var s : students) {
            if (s.getBranch() == null || s.getBranch().isBlank()) {
                s.setBranch("CSE");
                if (s.getRollNumber() == null || s.getRollNumber().isBlank()) {
                    s.setRollNumber(s.getStudentId());
                }
                studentRepository.save(s);
                log.info("Updated student {} with branch CSE and rollNumber {}", s.getName(), s.getRollNumber());
            }
        }
    }
}
