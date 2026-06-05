package com.pulse.attendance.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "batch_attendance_records")
@CompoundIndexes({
    @CompoundIndex(name = "batch_student_date_session_idx",
            def = "{'batchId': 1, 'studentId': 1, 'attendanceDate': 1, 'session': 1}",
            unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchAttendanceRecord {
    @Id
    private String id;

    @Indexed
    private String batchId;

    @Indexed
    private String studentId;

    private String studentName;
    private String rollNumber;

    private LocalDate attendanceDate;

    // FN or AN
    private String session;

    // PRESENT, ABSENT, NOT_MARKED
    private String status;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
