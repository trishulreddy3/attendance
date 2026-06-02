package com.pulse.attendance.repository;

import com.pulse.attendance.entity.Attendance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttendanceRepository extends MongoRepository<Attendance, String> {
    boolean existsBySessionIdAndStudentId(String sessionId, String studentId);
    
    List<Attendance> findBySessionIdOrderByMarkedAtDesc(String sessionId);
    List<Attendance> findByStudentIdOrderByMarkedAtDesc(String studentId);
    
    // Note: since session is a DocumentReference, filtering by session.subject requires manual handling or aggregation in Mongo. 
    // We will do filtering in the service layer if needed, so we just provide a basic findByStudentId here.
    List<Attendance> findByStudentId(String studentId);
    
    long countBySessionId(String sessionId);
    long countByStudentId(String studentId);

    List<Attendance> findByMarkedAtBetween(LocalDateTime startOfDay, LocalDateTime endOfDay);
}
