package com.pulse.attendance.repository;

import com.pulse.attendance.entity.BatchAttendanceRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BatchAttendanceRecordRepository extends MongoRepository<BatchAttendanceRecord, String> {
    List<BatchAttendanceRecord> findByBatchIdOrderByAttendanceDateAscSessionAsc(String batchId);
    List<BatchAttendanceRecord> findByBatchIdAndStudentId(String batchId, String studentId);
    List<BatchAttendanceRecord> findByStudentId(String studentId);
    Optional<BatchAttendanceRecord> findByBatchIdAndStudentIdAndAttendanceDateAndSession(
            String batchId, String studentId, LocalDate attendanceDate, String session);
    long countByBatchId(String batchId);
    void deleteByBatchId(String batchId);
    void deleteByStudentId(String studentId);
}
