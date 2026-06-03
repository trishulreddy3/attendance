package com.pulse.attendance.service;

import com.pulse.attendance.dto.request.Requests.MarkAttendanceReq;
import com.pulse.attendance.dto.response.Responses.AttendanceDTO;
import com.pulse.attendance.dto.response.Responses.SessionDTO;
import com.pulse.attendance.entity.Attendance;
import com.pulse.attendance.entity.Session;
import com.pulse.attendance.entity.Student;
import com.pulse.attendance.exception.ApiException;
import com.pulse.attendance.mapper.EntityMapper;
import com.pulse.attendance.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.lang.String;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final SessionService sessionService;
    private final StudentService studentService;
    private final GeoLocationService geoLocationService;
    private final EntityMapper mapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void markAttendance(String studentId, MarkAttendanceReq req) {
        Session session = sessionService.getSessionEntity(req.sessionId());
        Student student = studentService.getStudentEntity(studentId);

        // 1. Validate session active
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(session.getStartTime()) || now.isAfter(session.getEndTime())) {
            throw new ApiException("Session is not active", HttpStatus.BAD_REQUEST);
        }

        // 1.5 Validate branch
        if (!student.getBranch().equalsIgnoreCase(session.getBranch())) {
            throw new ApiException("You do not belong to the branch for this session", HttpStatus.BAD_REQUEST);
        }

        // 2. Validate student hasn't marked already
        if (attendanceRepository.existsBySessionIdAndStudentId(session.getId(), studentId)) {
            throw new ApiException("Attendance already marked", HttpStatus.BAD_REQUEST);
        }

        // 3. Validate QR Token
        boolean isValidCurrent = req.qrToken().equals(session.getCurrentQrToken());
        boolean isValidPrevious = req.qrToken().equals(session.getPreviousQrToken());
        
        if (!isValidCurrent && !isValidPrevious) {
            throw new ApiException("Invalid QR Token", HttpStatus.BAD_REQUEST);
        }
        
        if (isValidPrevious && now.isAfter(session.getTokenExpiresAt())) {
            throw new ApiException("QR Token has expired. Please scan the latest code.", HttpStatus.BAD_REQUEST);
        }

        // 4. Validate GPS
        BigDecimal distance = null;
        if (session.getSessionLatitude() != null && session.getSessionLongitude() != null) {
            if (req.latitude() == null || req.longitude() == null) {
                throw new ApiException("Location permission required to mark attendance", HttpStatus.BAD_REQUEST);
            }
            
            double calcDist = geoLocationService.calculateDistance(
                    session.getSessionLatitude(), session.getSessionLongitude(),
                    req.latitude(), req.longitude()
            );
            
            if (calcDist > session.getAllowedRadiusMeters()) {
                throw new ApiException("You are outside the allowed attendance zone. Distance: " + Math.round(calcDist) + "m", HttpStatus.BAD_REQUEST);
            }
            distance = BigDecimal.valueOf(calcDist);
        }

        Attendance attendance = Attendance.builder()
                .session(session)
                .student(student)
                .studentLatitude(req.latitude())
                .studentLongitude(req.longitude())
                .distanceFromSession(distance)
                .build();

        attendance = attendanceRepository.save(attendance);

        // 4. WebSocket Update
        AttendanceDTO dto = mapper.toAttendanceDTO(attendance);
        messagingTemplate.convertAndSend("/topic/session/" + session.getId() + "/attendance", dto);
    }

    public List<AttendanceDTO> getSessionAttendance(String sessionId) {
        return mapper.toAttendanceDTOs(attendanceRepository.findBySessionIdOrderByMarkedAtDesc(sessionId));
    }

    public List<AttendanceDTO> getStudentAttendance(String studentId) {
        return mapper.toAttendanceDTOs(attendanceRepository.findByStudentIdOrderByMarkedAtDesc(studentId));
    }

    public List<SessionDTO> getMyHistory(String studentId, String subject, String month) {
        // Here we ideally fetch sessions and map if present.
        // For simplicity, we just fetch from sessionService and filter.
        Student student = studentService.getStudentEntity(studentId);
        List<SessionDTO> branchSessions = sessionService.getActiveSessions(student.getBranch()); 
        // Wait, history shouldn't just be active.
        return sessionService.getHistory().stream()
                .filter(s -> s.branch().equals(student.getBranch()))
                .filter(s -> subject == null || subject.equals("ALL") || s.subject().equals(subject))
                .filter(s -> {
                    if (month == null || month.equals("ALL")) return true;
                    String m = s.startTime().getYear() + "-" + (s.startTime().getMonthValue() - 1); // JS 0-indexed month format
                    return m.equals(month);
                })
                .collect(Collectors.toList());
    }
}
