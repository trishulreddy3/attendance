package com.pulse.attendance.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "batches")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Batch {
    @Id
    private String id;

    @Indexed(unique = true)
    private String batchName;

    @Indexed
    private String facultyId;

    private String facultyName;
    private String facultyEmail;
    private String facultyMobile;

    private LocalDate startDate;
    private LocalDate endDate;

    private long studentCount;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
