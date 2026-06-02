package com.pulse.attendance.repository;

import com.pulse.attendance.entity.Session;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SessionRepository extends MongoRepository<Session, String> {
    List<Session> findByFacultyIdOrderByStartTimeDesc(String facultyId);
    List<Session> findByBranchOrderByStartTimeDesc(String branch);

    @Query("{ 'branch': ?0, 'startTime': { $lte: ?1 }, 'endTime': { $gte: ?1 } }")
    List<Session> findActiveSessions(String branch, LocalDateTime now);
    
    @Query("{ 'faculty': ?0, 'startTime': { $lte: ?1 }, 'endTime': { $gte: ?1 } }")
    List<Session> findActiveSessionsByFaculty(String facultyId, LocalDateTime now);

    List<Session> findByStartTimeBetween(LocalDateTime startOfDay, LocalDateTime endOfDay);
}
