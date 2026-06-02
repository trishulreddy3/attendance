package com.pulse.attendance.service;

import com.pulse.attendance.dto.response.Responses.BranchStat;
import com.pulse.attendance.dto.response.Responses.ReportDTO;
import com.pulse.attendance.dto.response.Responses.SubjectStat;
import com.pulse.attendance.entity.Session;
import com.pulse.attendance.entity.Student;
import com.pulse.attendance.repository.AttendanceRepository;
import com.pulse.attendance.repository.SessionRepository;
import com.pulse.attendance.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.lang.String;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final StudentRepository studentRepository;
    private final SessionRepository sessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final SessionService sessionService;

    public ReportDTO getFacultyReports(String facultyId) {
        List<Student> students = studentRepository.findByCreatedById(facultyId);
        List<Session> sessions = sessionRepository.findByFacultyIdOrderByStartTimeDesc(facultyId);

        List<String> branches = List.of("AIML", "CSE", "AI", "AIDS", "IT", "MECH", "CIVIL");
        
        List<BranchStat> branchStats = branches.stream().map(b -> {
            long st = students.stream().filter(s -> s.getBranch().equals(b)).count();
            long att = sessions.stream().filter(s -> s.getBranch().equals(b))
                    .mapToLong(s -> attendanceRepository.countBySessionId(s.getId())).sum();
            return new BranchStat(b, st, att);
        }).collect(Collectors.toList());

        Map<String, Long> subCount = sessions.stream().collect(
                Collectors.groupingBy(Session::getSubject, 
                        Collectors.summingLong(s -> attendanceRepository.countBySessionId(s.getId())))
        );

        List<SubjectStat> subjectStats = subCount.entrySet().stream()
                .map(e -> new SubjectStat(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        return new ReportDTO(branchStats, subjectStats, sessionService.getFacultySessions(facultyId));
    }
}
