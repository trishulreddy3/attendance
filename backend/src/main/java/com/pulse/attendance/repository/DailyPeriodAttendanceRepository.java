package com.pulse.attendance.repository;

import com.pulse.attendance.entity.DailyPeriodAttendance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyPeriodAttendanceRepository extends MongoRepository<DailyPeriodAttendance, String> {

    Optional<DailyPeriodAttendance> findByStudentIdAndAttendanceDateAndPeriod(
            String studentId, LocalDate attendanceDate, Integer period);

    boolean existsByStudentIdAndAttendanceDateAndPeriod(
            String studentId, LocalDate attendanceDate, Integer period);

    List<DailyPeriodAttendance> findByDepartmentIgnoreCaseAndAttendanceDate(
            String department, LocalDate attendanceDate);

    List<DailyPeriodAttendance> findByDepartmentIgnoreCaseAndAttendanceDateBetween(
            String department, LocalDate startDate, LocalDate endDate);

    List<DailyPeriodAttendance> findByStudentIdAndAttendanceDateBetween(
            String studentId, LocalDate startDate, LocalDate endDate);

    List<DailyPeriodAttendance> findByAttendanceDate(LocalDate attendanceDate);

    List<DailyPeriodAttendance> findByAttendanceDateBetween(LocalDate startDate, LocalDate endDate);

    long deleteByDepartmentIgnoreCaseAndAttendanceDate(String department, LocalDate attendanceDate);
}
