package com.pulse.attendance.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.lang.String;

public class Responses {
    public record AuthResponse(String token, String kind, String id) {}
    
    public record MessageResponse(String message) {}
    
    public record AdminDTO(String id, String name, String email) {}
    
    public record FacultyDTO(String id, String name, String email, String mobile, String branch) {}
    
    public record StudentDTO(String id, String studentId, String name, String email, String mobile, String branch, String createdBy) {}
    
    public record SessionDTO(
        String id, String name, String subject, String branch, 
        LocalDateTime startTime, LocalDateTime endTime, String type, 
        String facultyId, String qrToken, List<AttendanceDTO> attendees
    ) {}
    
    public record AttendanceDTO(String studentId, LocalDateTime at, BigDecimal latitude, BigDecimal longitude, BigDecimal distance) {}

    // Dashboards
    public record FacultyDashboardDTO(
        long totalStudents,
        long activeSessions,
        long presentToday,
        int attendanceRate,
        List<ChartData> last7Days,
        List<ActivityDTO> recentActivity
    ) {}

    public record StudentDashboardDTO(
        long totalClasses,
        long present,
        long absent,
        int attendancePct,
        List<ChartData> last7Days,
        List<SessionDTO> recentAttendance
    ) {}
    
    public record ChartData(String label, int value) {}
    
    public record ActivityDTO(String studentName, String sessionName, LocalDateTime at) {}

    public record AdminDashboardDTO(
            long totalFaculty,
            long totalStudents,
            long totalSessions,
            long totalAttendance,
            List<FacultyDTO> facultyList,
            List<ChartData> activityData
    ) {}

    public record DeviceBindingDTO(
            String studentId,
            String studentName,
            String deviceFingerprint,
            LocalDateTime boundAt,
            String status
    ) {}
    
    // Reports
    public record ReportDTO(List<BranchStat> branchStats, List<SubjectStat> subjectStats, List<SessionDTO> sessionLog) {}
    public record BranchStat(String branch, long students, long attendance) {}
    public record SubjectStat(String subject, long attendance) {}
    
    // QR
    public record QrResponse(String qrToken, int refreshInterval) {}
}
