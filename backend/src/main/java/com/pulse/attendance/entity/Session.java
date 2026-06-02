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

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Session {
    @Id
    private String id;

    private String name;
    private String subject;
    private String branch;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String sessionType;

    @DocumentReference(lazy = true)
    private Faculty faculty;

    @Indexed
    private String currentQrToken;
    private String previousQrToken;
    private LocalDateTime tokenExpiresAt;

    private BigDecimal sessionLatitude;
    private BigDecimal sessionLongitude;
    private Integer allowedRadiusMeters;

    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
