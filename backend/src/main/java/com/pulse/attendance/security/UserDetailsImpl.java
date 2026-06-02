package com.pulse.attendance.security;

import com.pulse.attendance.entity.Faculty;
import com.pulse.attendance.entity.Student;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.lang.String;

@Data
@AllArgsConstructor
public class UserDetailsImpl implements UserDetails {
    private String id;
    private String username;
    private String email;
    private String password;
    private String role;
    private Collection<? extends GrantedAuthority> authorities;

    public static UserDetailsImpl build(Faculty faculty) {
        return new UserDetailsImpl(
                faculty.getId(),
                faculty.getEmail(), // username is email
                faculty.getEmail(),
                faculty.getPassword(),
                "ROLE_FACULTY",
                List.of(new SimpleGrantedAuthority("ROLE_FACULTY"))
        );
    }

    public static UserDetailsImpl build(Student student) {
        return new UserDetailsImpl(
                student.getId(),
                student.getStudentId(), // username is studentId
                student.getEmail(),
                student.getPassword(),
                "ROLE_STUDENT",
                List.of(new SimpleGrantedAuthority("ROLE_STUDENT"))
        );
    }

    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }
}
