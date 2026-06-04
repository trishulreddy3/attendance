package com.pulse.attendance.security;

import com.pulse.attendance.entity.Admin;
import com.pulse.attendance.entity.Faculty;
import com.pulse.attendance.entity.Student;
import com.pulse.attendance.repository.AdminRepository;
import com.pulse.attendance.repository.FacultyRepository;
import com.pulse.attendance.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final AdminRepository adminRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // First try finding as Admin
        Optional<Admin> admin = adminRepository.findByEmail(username);
        if (admin.isPresent()) {
            return UserDetailsImpl.build(admin.get());
        }

        // Then try finding as Faculty (email)
        Optional<Faculty> faculty = facultyRepository.findByEmail(username);
        if (faculty.isPresent()) {
            return UserDetailsImpl.build(faculty.get());
        }

        // Then try finding as Student (studentId or email)
        Optional<Student> student = studentRepository.findByStudentId(username);
        if (student.isPresent()) {
            return UserDetailsImpl.build(student.get());
        }
        student = studentRepository.findByEmail(username);
        if (student.isPresent()) {
            return UserDetailsImpl.build(student.get());
        }

        throw new UsernameNotFoundException("User Not Found with username: " + username);
    }
}
