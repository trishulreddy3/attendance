package com.pulse.attendance.service;

import com.pulse.attendance.entity.Admin;
import com.pulse.attendance.repository.AdminRepository;
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
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedAdmin();
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
}
