package com.pulse.attendance.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Stores student daily period attendance records for Periods 1 to 7.
 * Uniqueness constraint on (studentId, attendanceDate, period) prevents duplicate entries.
 */
@Document(collection = "daily_period_attendance")
@CompoundIndexes({
    @CompoundIndex(name = "student_date_period_unique_idx",
            def = "{'studentId': 1, 'attendanceDate': 1, 'period': 1}",
            unique = true),
    @CompoundIndex(name = "dept_date_idx",
            def = "{'department': 1, 'attendanceDate': 1}")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyPeriodAttendance {
    @Id
    private String id;

    @Indexed
    private String studentId;

    private String rollNumber;
    private String studentName;

    @Indexed
    private String department;

    @Indexed
    private LocalDate attendanceDate;

    // Period 1 to 7
    private Integer period;

    // PRESENT or ABSENT
    private String status;

    private String markedBy;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
