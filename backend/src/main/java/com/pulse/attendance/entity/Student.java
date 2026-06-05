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
import org.springframework.data.mongodb.core.mapping.DocumentReference;

import java.time.LocalDateTime;

@Document(collection = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {
    @Id
    private String id;

    @Indexed(unique = true)
    private String studentId;

    @Indexed
    private String rollNumber;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String mobile;

    private String password;

    private String branch;

    @Indexed
    private String batchId;

    private String batchName;

    @DocumentReference(lazy = true)
    private Faculty createdBy;

    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
