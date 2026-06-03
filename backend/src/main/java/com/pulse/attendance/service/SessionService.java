package com.pulse.attendance.service;

import com.pulse.attendance.dto.request.Requests.CreateSessionReq;
import com.pulse.attendance.dto.request.Requests.UpdateSessionReq;
import com.pulse.attendance.dto.response.Responses.SessionDTO;
import com.pulse.attendance.entity.Faculty;
import com.pulse.attendance.entity.Session;
import com.pulse.attendance.exception.ApiException;
import com.pulse.attendance.mapper.EntityMapper;
import com.pulse.attendance.repository.AttendanceRepository;
import com.pulse.attendance.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.lang.String;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final FacultyService facultyService;
    private final EntityMapper mapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${attendance.default-radius:30}")
    private int defaultRadius;

    public Session getSessionEntity(String sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException("Session not found", HttpStatus.NOT_FOUND));
    }

    private SessionDTO mapWithAttendees(Session session) {
        SessionDTO dto = mapper.toSessionDTO(session);
        return new SessionDTO(
                dto.id(), dto.name(), dto.subject(), dto.branch(),
                dto.startTime(), dto.endTime(), dto.type(), dto.facultyId(),
                dto.qrToken(),
                mapper.toAttendanceDTOs(attendanceRepository.findBySessionIdOrderByMarkedAtDesc(session.getId()))
        );
    }

    @Transactional
    public SessionDTO createSession(String facultyId, CreateSessionReq req) {
        Faculty faculty = facultyService.getFacultyEntity(facultyId);

        Session session = Session.builder()
                .name(req.name())
                .subject(req.subject())
                .branch(req.branch())
                .sessionType(req.type())
                .startTime(req.startTime())
                .endTime(req.endTime())
                .faculty(faculty)
                .currentQrToken(java.util.UUID.randomUUID().toString())
                .tokenExpiresAt(LocalDateTime.now().plusSeconds(30))
                .sessionLatitude(req.latitude())
                .sessionLongitude(req.longitude())
                .allowedRadiusMeters(defaultRadius)
                .build();

        return mapWithAttendees(sessionRepository.save(session));
    }

    public SessionDTO getSession(String sessionId) {
        return mapWithAttendees(getSessionEntity(sessionId));
    }

    public List<SessionDTO> getFacultySessions(String facultyId) {
        return sessionRepository.findByFacultyIdOrderByStartTimeDesc(facultyId)
                .stream().map(this::mapWithAttendees).collect(Collectors.toList());
    }

    public List<SessionDTO> getActiveSessions(String branch) {
        return sessionRepository.findActiveSessions(branch, LocalDateTime.now())
                .stream().map(this::mapWithAttendees).collect(Collectors.toList());
    }

    public List<SessionDTO> getHistory() {
        return sessionRepository.findAll().stream().map(this::mapWithAttendees).collect(Collectors.toList());
    }

    @Transactional
    public SessionDTO updateSession(String facultyId, String sessionId, UpdateSessionReq req) {
        Session session = getSessionEntity(sessionId);
        if (session.getFaculty() == null || !facultyId.equals(session.getFaculty().getId())) {
            throw new ApiException("Not authorized", HttpStatus.FORBIDDEN);
        }

        if (req.name() != null) session.setName(req.name());
        if (req.subject() != null) session.setSubject(req.subject());
        if (req.branch() != null) session.setBranch(req.branch());
        if (req.type() != null) session.setSessionType(req.type());
        if (req.startTime() != null) session.setStartTime(req.startTime());
        if (req.endTime() != null) session.setEndTime(req.endTime());

        return mapWithAttendees(sessionRepository.save(session));
    }

    @Transactional
    public void deleteSession(String facultyId, String sessionId) {
        Session session = getSessionEntity(sessionId);
        if (session.getFaculty() == null || !facultyId.equals(session.getFaculty().getId())) {
            throw new ApiException("Not authorized", HttpStatus.FORBIDDEN);
        }
        sessionRepository.delete(session);
    }
    
    @Transactional
    public String refreshQr(String facultyId, String sessionId) {
        Session session = getSessionEntity(sessionId);
        if (!session.getFaculty().getId().equals(facultyId)) {
            throw new ApiException("Not authorized", HttpStatus.FORBIDDEN);
        }
        
        String newToken = java.util.UUID.randomUUID().toString();
        session.setPreviousQrToken(session.getCurrentQrToken());
        session.setCurrentQrToken(newToken);
        session.setTokenExpiresAt(LocalDateTime.now().plusSeconds(30));
        sessionRepository.save(session);
        
        // Notify clients via WebSocket
        messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/qr", newToken);
        
        return newToken;
    }
}
