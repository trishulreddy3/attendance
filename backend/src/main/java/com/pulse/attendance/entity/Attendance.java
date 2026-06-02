package com.pulse.attendance.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "attendances")
@CompoundIndex(name = "student_session_idx", def = "{'student': 1, 'session': 1}", unique = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {
    @Id
    private String id;

    @DocumentReference(lazy = true)
    private Session session;

    @DocumentReference(lazy = true)
    private Student student;

    @CreatedDate
    private LocalDateTime markedAt;

    private BigDecimal studentLatitude;
    private BigDecimal studentLongitude;
    private BigDecimal distanceFromSession;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
