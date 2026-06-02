package com.pulse.attendance.service;

import com.pulse.attendance.dto.response.Responses.ChartData;
import com.pulse.attendance.dto.response.Responses.FacultyDashboardDTO;
import com.pulse.attendance.dto.response.Responses.StudentDashboardDTO;
import com.pulse.attendance.dto.response.Responses.ActivityDTO;
import com.pulse.attendance.entity.Session;
import com.pulse.attendance.entity.Student;
import com.pulse.attendance.repository.AttendanceRepository;
import com.pulse.attendance.repository.SessionRepository;
import com.pulse.attendance.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final StudentRepository studentRepository;
    private final SessionRepository sessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final SessionService sessionService;
    private final MongoTemplate mongoTemplate;

    public FacultyDashboardDTO getFacultyDashboard(String facultyId) {
        long totalStudents = studentRepository.findByCreatedById(facultyId).size();
        LocalDateTime now = LocalDateTime.now();
        long activeSessions = sessionRepository.findActiveSessionsByFaculty(facultyId, now).size();
        
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        
        long presentToday = attendanceRepository.findByMarkedAtBetween(startOfDay, endOfDay).stream()
                .filter(a -> a.getSession().getFaculty().getId().equals(facultyId))
                .map(a -> a.getStudent().getId())
                .distinct().count();

        List<Session> allFacultySessions = sessionRepository.findByFacultyIdOrderByStartTimeDesc(facultyId);
        long totalSlots = allFacultySessions.size() * Math.max(1, totalStudents);
        long totalAttended = allFacultySessions.stream().mapToLong(s -> attendanceRepository.countBySessionId(s.getId())).sum();
        int rate = totalSlots > 0 ? (int) Math.round((totalAttended * 100.0) / totalSlots) : 0;

        // Last 7 days using MongoDB Aggregation
        LocalDateTime sevenDaysAgo = now.toLocalDate().minusDays(6).atStartOfDay();

        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("markedAt").gte(sevenDaysAgo).lte(now)),
                Aggregation.lookup("sessions", "session", "_id", "sessionObj"),
                Aggregation.unwind("sessionObj"),
                Aggregation.match(Criteria.where("sessionObj.faculty").is(new ObjectId(facultyId))),
                Aggregation.project("markedAt")
                        .andExpression("year(markedAt)").as("year")
                        .andExpression("month(markedAt)").as("month")
                        .andExpression("dayOfMonth(markedAt)").as("day"),
                Aggregation.group("year", "month", "day").count().as("count"),
                Aggregation.project("count")
                        .and("_id.year").as("year")
                        .and("_id.month").as("month")
                        .and("_id.day").as("day")
        );

        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "attendances", Document.class);
        
        Map<LocalDate, Integer> counts = new HashMap<>();
        for (Document doc : results.getMappedResults()) {
            LocalDate date = LocalDate.of(doc.getInteger("year"), doc.getInteger("month"), doc.getInteger("day"));
            counts.put(date, doc.getInteger("count"));
        }

        List<ChartData> last7Days = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = now.toLocalDate().minusDays(i);
            int count = counts.getOrDefault(d, 0);
            last7Days.add(new ChartData(d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH), count));
        }

        List<ActivityDTO> recentActivity = attendanceRepository.findAll().stream()
                .filter(a -> a.getSession().getFaculty().getId().equals(facultyId))
                .sorted((a, b) -> b.getMarkedAt().compareTo(a.getMarkedAt()))
                .limit(6)
                .map(a -> new ActivityDTO(a.getStudent().getName(), a.getSession().getName(), a.getMarkedAt()))
                .collect(Collectors.toList());

        return new FacultyDashboardDTO(totalStudents, activeSessions, presentToday, rate, last7Days, recentActivity);
    }

    public StudentDashboardDTO getStudentDashboard(String studentId) {
        Student student = studentRepository.findById(studentId).orElseThrow();
        
        List<Session> branchSessions = sessionRepository.findByBranchOrderByStartTimeDesc(student.getBranch());
        long totalClasses = branchSessions.size();
        
        long present = attendanceRepository.countByStudentId(studentId);
        long absent = Math.max(0, totalClasses - present);
        int pct = totalClasses > 0 ? (int) Math.round((present * 100.0) / totalClasses) : 0;

        // For student, we can just fetch all their attendance and group in memory since it's small,
        // but we will use an aggregation to be fully compliant.
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.toLocalDate().minusDays(6).atStartOfDay();

        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("student").is(new ObjectId(studentId)).and("markedAt").gte(sevenDaysAgo).lte(now)),
                Aggregation.project("markedAt")
                        .andExpression("year(markedAt)").as("year")
                        .andExpression("month(markedAt)").as("month")
                        .andExpression("dayOfMonth(markedAt)").as("day"),
                Aggregation.group("year", "month", "day").count().as("count"),
                Aggregation.project("count")
                        .and("_id.year").as("year")
                        .and("_id.month").as("month")
                        .and("_id.day").as("day")
        );

        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "attendances", Document.class);
        Map<LocalDate, Integer> counts = new HashMap<>();
        for (Document doc : results.getMappedResults()) {
            LocalDate date = LocalDate.of(doc.getInteger("year"), doc.getInteger("month"), doc.getInteger("day"));
            counts.put(date, doc.getInteger("count"));
        }

        List<ChartData> last7Days = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = now.toLocalDate().minusDays(i);
            int count = counts.getOrDefault(d, 0);
            // Graph expects percentage for student, but let's show raw attendance count for simplicity
            last7Days.add(new ChartData(d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH), count));
        }

        var recent = sessionService.getHistory().stream()
                .filter(s -> s.attendees().stream().anyMatch(a -> a.studentId().equals(studentId)))
                .limit(5)
                .collect(Collectors.toList());

        return new StudentDashboardDTO(totalClasses, present, absent, pct, last7Days, recent);
    }
}
